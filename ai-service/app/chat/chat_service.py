# ai-service/app/chat/chat_service.py
# Orchestration layer for the portfolio chat endpoint.
#
# Flow:
#   1. Rate-limit check (per client IP / session)
#   2. Build message list: system prompt + history + current message
#   3. Resolve provider from request or settings default
#   4. Call provider (streaming or non-streaming)
#   5. Return PortfolioChatResponse or AsyncGenerator[StreamChunkDTO]
#
# Auth hook: _resolve_client_id() is the single place to swap IP-based
# identification for a JWT claim when auth is added.

from __future__ import annotations

import logging
import re as _re
from collections.abc import AsyncGenerator

from app.chat.dtos import (
    ConversationRole,
    PortfolioChatRequest,
    PortfolioChatResponse,
    StreamChunkDTO,
    StreamEventType,
    TokenUsageDTO,
)
from app.core.config import get_settings
from app.core.logging import generate_request_id, log_ai_error, log_ai_request, log_ai_response, now_ms
from app.core.rate_limiter import get_rate_limiter
from app.knowledge.prompt_builder import build_system_prompt
from app.models.ai_models import (
    AIProvider,
    ChatMessage,
    ChatRequest,
    MessageRole,
)
from app.providers.registry import get_provider, get_provider_chain
from app.services.exceptions import AINotConfiguredError, AIQuotaExceededError, AIRateLimitError, AIServiceError

logger = logging.getLogger("ai.chat")
settings = get_settings()

# System prompt is rebuilt per-request via get_knowledge() mtime cache.
# No uvicorn restart needed after editing content — just re-run `npm run dev`.

# Context window budget: reserve ~12k chars for system prompt + response.
# Remaining ~20k chars (~5k tokens) for history.
_MAX_HISTORY_CHARS = 20_000
_MAX_HISTORY_TURNS = 10


def _trim_history(history: list) -> list:
    """
    Server-side guard: trim history to fit context window.
    Keeps the most recent complete pairs (user+assistant).
    """
    if not history:
        return history

    # Ensure we start on a user message
    start = 0
    if history[0].role == ConversationRole.ASSISTANT:
        start = 1

    # Keep at most MAX_HISTORY_TURNS * 2 messages from the tail
    trimmed = history[start:][-(_MAX_HISTORY_TURNS * 2):]

    # Trim by character budget from the front
    total = sum(len(m.content) for m in trimmed)
    while total > _MAX_HISTORY_CHARS and len(trimmed) >= 2:
        total -= len(trimmed[0].content) + len(trimmed[1].content)
        trimmed = trimmed[2:]

    return trimmed


# Ordered: first match wins per keyword. Recruiter-oriented intents first.
_FOLLOW_UP_PATTERNS: list[tuple] = [
    # Recruiter intents
    (r"interview",                ["What system design questions should I ask?", "What are his strongest technical areas?"]),
    (r"architecture|design",      ["What were the key technical challenges?", "How does he approach system design?"]),
    (r"multi.?tenant|saas",       ["How did he handle tenant data isolation?", "What cloud infrastructure did he use?"]),
    (r"kafka|event.?stream",      ["What was the throughput and latency achieved?", "Did he use event sourcing?"]),
    (r"llm|openai|gpt|ai pipeline", ["What was the straight-through rate achieved?", "How did he reduce token costs?"]),
    (r"cloud|aws|kubernetes|ecs", ["What specific AWS services did he use?", "How did he handle CI/CD?"]),
    (r"backend|api|spring",       ["List his backend projects", "What databases has he worked with?"]),
    (r"payroll|compliance",       ["How many statutory rules did the engine handle?", "What was the batch processing improvement?"]),
    (r"reconcil|fintech|payment", ["What accuracy did the reconciliation engine achieve?", "How did he prevent duplicate charges?"]),
    (r"metric|achiev|result",     ["Summarise all key metrics in a table", "Which project had the biggest impact?"]),
    (r"fit|role|hire|position",   ["Generate interview questions for this candidate", "What roles is he best suited for?"]),
    (r"experience|career|year",   ["What is his current role?", "List his backend experience"]),
    (r"project|built",            ["Compare all projects in a table", "What were the technical challenges?"]),
    (r"skill|tech|stack",         ["List his AI experience", "Show his cloud projects"]),
    (r"service|freelance|hire",   ["How do I book a discovery call?", "What is his typical project timeline?"]),
    (r"contact|email|reach",      ["Can I book a call directly?"]),
    (r"available",                ["What is his current availability?", "How do I get started?"]),
]


def _generate_follow_ups(content: str) -> list[str]:
    """Recruiter-oriented follow-up suggestions based on the assistant's reply."""
    content_lower = content.lower()
    seen: set[str] = set()
    suggestions: list[str] = []
    for pattern, questions in _FOLLOW_UP_PATTERNS:
        if _re.search(pattern, content_lower):
            for q in questions:
                if q not in seen:
                    seen.add(q)
                    suggestions.append(q)
        if len(suggestions) >= 3:
            break
    return suggestions[:3]


def _to_provider_messages(
    request: PortfolioChatRequest,
) -> list[ChatMessage]:
    """
    Assembles the full message list for the provider:
      [system] + [trimmed history turns] + [current user message]
    """
    messages: list[ChatMessage] = [
        ChatMessage(role=MessageRole.SYSTEM, content=build_system_prompt()),
    ]
    for turn in _trim_history(request.history):
        role = (
            MessageRole.USER
            if turn.role == ConversationRole.USER
            else MessageRole.ASSISTANT
        )
        messages.append(ChatMessage(role=role, content=turn.content))

    messages.append(ChatMessage(role=MessageRole.USER, content=_sanitize_message(request.message)))
    return messages


# ── Prompt injection guard ────────────────────────────────────────────────────
# Strip attempts to override the system prompt via bracket-prefixed injections.
_INJECTION_PATTERN = _re.compile(
    r'\[\s*(context|system|instruction|ignore|override|prompt)[^\]]*\]',
    _re.IGNORECASE,
)


def _sanitize_message(message: str) -> str:
    """Remove prompt injection attempts from user messages."""
    sanitized = _INJECTION_PATTERN.sub('', message).strip()
    # Truncate to hard limit regardless of DTO validation (defence in depth)
    return sanitized[:4_500]


def _is_failover_error(exc: Exception) -> bool:
    """True = try next provider. False = fail immediately (config/auth errors)."""
    from app.services.exceptions import AIProviderUnavailableError, AITimeoutError
    if isinstance(exc, AINotConfiguredError):
        return False
    if isinstance(exc, (AIQuotaExceededError, AIProviderUnavailableError, AITimeoutError)):
        return True
    msg = str(exc).lower()
    return any(s in msg for s in ("429", "quota", "rate limit", "timeout", "unavailable", "503", "overloaded"))


def _build_chat_request(
    request: PortfolioChatRequest,
    request_id: str,
) -> ChatRequest:
    from app.models.ai_models import AIProvider as _AIProvider

    provider_enum: AIProvider | None = None
    if request.provider:
        provider_enum = _AIProvider(request.provider)

    return ChatRequest(
        messages=_to_provider_messages(request),
        provider=provider_enum,
        model=request.model,
        max_tokens=settings.OPENAI_MAX_TOKENS,
        temperature=settings.OPENAI_TEMPERATURE,
        stream=request.stream,
        context_key="portfolio_chat",
        metadata={"session_id": request.session_id, "request_id": request_id},
    )


class ChatService:

    # ── Non-streaming ─────────────────────────────────────────────────────────

    async def chat(
        self,
        request: PortfolioChatRequest,
        client_id: str,
    ) -> PortfolioChatResponse:
        self._check_rate_limit(client_id)

        request_id = generate_request_id()
        chat_req   = _build_chat_request(request, request_id)

        # If the request pins a specific provider, use only that one.
        # Otherwise use the full failover chain.
        if request.provider:
            chain = [get_provider(AIProvider(request.provider))]
        else:
            chain = get_provider_chain()

        last_exc: AIServiceError = AIServiceError(provider="none", message="No providers available.")
        start_ms = now_ms()

        for attempt, provider in enumerate(chain, 1):
            log_ai_request(
                provider=provider.provider_name,
                model=request.model or provider.default_model,
                request_id=request_id,
                extra={
                    "session_id":    request.session_id,
                    "history_turns": len(request.history),
                    "client_id":     client_id,
                    "attempt":       attempt,
                },
            )
            try:
                response = await provider.chat(chat_req)
            except AIServiceError as exc:
                log_ai_error(provider=provider.provider_name,
                             model=request.model or provider.default_model,
                             request_id=request_id, error=exc.message, attempt=attempt)
                last_exc = exc
                if _is_failover_error(exc) and attempt < len(chain):
                    logger.warning("Provider '%s' failed (%s) — trying next",
                                   provider.provider_name, exc.message)
                    continue
                raise
            except Exception as exc:
                log_ai_error(provider=provider.provider_name,
                             model=request.model or provider.default_model,
                             request_id=request_id, error=str(exc), attempt=attempt)
                last_exc = AIServiceError(provider=provider.provider_name, message=str(exc))
                if _is_failover_error(exc) and attempt < len(chain):
                    logger.warning("Provider '%s' failed (%s) — trying next",
                                   provider.provider_name, str(exc))
                    continue
                raise last_exc from exc

            duration_ms = now_ms() - start_ms
            log_ai_response(provider=provider.provider_name, model=response.model,
                            request_id=request_id, duration_ms=duration_ms,
                            tokens_used=response.usage.total_tokens)

            return PortfolioChatResponse(
                request_id=request_id,
                session_id=request.session_id,
                content=response.content,
                provider=response.provider.value,
                model=response.model,
                usage=TokenUsageDTO(
                    prompt_tokens=response.usage.prompt_tokens,
                    completion_tokens=response.usage.completion_tokens,
                    total_tokens=response.usage.total_tokens,
                ),
                duration_ms=duration_ms,
                finish_reason=response.finish_reason,
                suggested_questions=_generate_follow_ups(response.content),
            )

        raise last_exc

    # ── Streaming ─────────────────────────────────────────────────────────────

    async def stream(
        self,
        request: PortfolioChatRequest,
        client_id: str,
    ) -> AsyncGenerator[str, None]:
        """
        Yields SSE-formatted strings: `data: <json>\n\n`
        The router wraps this in a StreamingResponse.
        """
        self._check_rate_limit(client_id)

        request_id = generate_request_id()

        if request.provider:
            chain = [get_provider(AIProvider(request.provider))]
        else:
            chain = get_provider_chain()

        start_ms  = now_ms()
        last_exc: Exception = AIServiceError(provider="none", message="No providers available.")

        for attempt, provider in enumerate(chain, 1):
            model = request.model or provider.default_model
            log_ai_request(
                provider=provider.provider_name, model=model, request_id=request_id,
                extra={"session_id": request.session_id, "history_turns": len(request.history),
                       "client_id": client_id, "streaming": True, "attempt": attempt},
            )
            try:
                async for chunk in self._stream_from_provider(provider, request, request_id):
                    yield chunk
                log_ai_response(provider=provider.provider_name, model=model,
                                request_id=request_id, duration_ms=now_ms() - start_ms)
                return
            except AIServiceError as exc:
                last_exc = exc
                if _is_failover_error(exc) and attempt < len(chain):
                    logger.warning("Stream provider '%s' failed (%s) — trying next",
                                   provider.provider_name, exc.message)
                    continue
                yield f"data: {StreamChunkDTO(event=StreamEventType.ERROR, request_id=request_id, error=exc.message).model_dump_json()}\n\n"
                return
            except Exception as exc:
                last_exc = exc
                if _is_failover_error(exc) and attempt < len(chain):
                    logger.warning("Stream provider '%s' failed (%s) — trying next",
                                   provider.provider_name, str(exc))
                    continue
                log_ai_error(provider=provider.provider_name, model=model,
                             request_id=request_id, error=str(exc), attempt=attempt)
                yield f"data: {StreamChunkDTO(event=StreamEventType.ERROR, request_id=request_id, error='An unexpected error occurred.').model_dump_json()}\n\n"
                return

        err_msg = last_exc.message if isinstance(last_exc, AIServiceError) else "All providers failed."
        yield f"data: {StreamChunkDTO(event=StreamEventType.ERROR, request_id=request_id, error=err_msg).model_dump_json()}\n\n"

    async def _stream_from_provider(
        self,
        provider,
        request: PortfolioChatRequest,
        request_id: str,
    ) -> AsyncGenerator[str, None]:
        """
        Delegates streaming to the provider.
        Any provider with a stream() method gets native streaming.
        All others fall back to a single non-streaming chat() call.
        """
        messages = _to_provider_messages(request)
        model    = request.model or provider.default_model

        from app.models.ai_models import ChatRequest as _ChatRequest
        chat_req = _ChatRequest(
            messages=messages,
            model=model,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            temperature=settings.OPENAI_TEMPERATURE,
            stream=True,
            context_key="portfolio_chat",
        )

        full_content = ""

        if hasattr(provider, "stream"):
            # Native streaming — works for openai, groq, openrouter, gemini
            async for text in provider.stream(chat_req, request_id):
                full_content += text
                yield f"data: {StreamChunkDTO(event=StreamEventType.DELTA, request_id=request_id, content=text).model_dump_json()}\n\n"
        else:
            # Fallback: non-streaming
            response = await provider.chat(chat_req)
            full_content = response.content
            yield f"data: {StreamChunkDTO(event=StreamEventType.DELTA, request_id=request_id, content=full_content).model_dump_json()}\n\n"

        yield f"data: {StreamChunkDTO(event=StreamEventType.DONE, request_id=request_id, provider=provider.provider_name, model=model, suggested_questions=_generate_follow_ups(full_content)).model_dump_json()}\n\n"

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _check_rate_limit(self, client_id: str) -> None:
        result = get_rate_limiter().check(client_id)
        if not result.allowed:
            raise AIRateLimitError(
                provider="service",
                retry_after=result.retry_after_seconds,
            )


# ── Singleton ─────────────────────────────────────────────────────────────────
_chat_service: ChatService | None = None


def get_chat_service() -> ChatService:
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service
