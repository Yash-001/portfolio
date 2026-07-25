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

import json
import logging
from collections.abc import AsyncGenerator
from functools import lru_cache

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
from app.providers.registry import get_provider
from app.services.exceptions import AIRateLimitError, AIServiceError

logger = logging.getLogger("ai.chat")
settings = get_settings()

# Build the system prompt once at startup — it's pure and static.
_SYSTEM_PROMPT: str = build_system_prompt()


def _to_provider_messages(
    request: PortfolioChatRequest,
) -> list[ChatMessage]:
    """
    Assembles the full message list for the provider:
      [system] + [history turns] + [current user message]
    """
    messages: list[ChatMessage] = [
        ChatMessage(role=MessageRole.SYSTEM, content=_SYSTEM_PROMPT),
    ]
    for turn in request.history:
        role = (
            MessageRole.USER
            if turn.role == ConversationRole.USER
            else MessageRole.ASSISTANT
        )
        messages.append(ChatMessage(role=role, content=turn.content))

    messages.append(ChatMessage(role=MessageRole.USER, content=request.message))
    return messages


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
        provider   = get_provider(
            AIProvider(request.provider) if request.provider else None
        )
        chat_req   = _build_chat_request(request, request_id)

        log_ai_request(
            provider=provider.provider_name,
            model=request.model or provider.default_model,
            request_id=request_id,
            extra={
                "session_id":    request.session_id,
                "history_turns": len(request.history),
                "client_id":     client_id,
            },
        )

        start_ms = now_ms()
        try:
            response = await provider.chat(chat_req)
        except AIServiceError:
            raise
        except Exception as exc:
            log_ai_error(
                provider=provider.provider_name,
                model=request.model or provider.default_model,
                request_id=request_id,
                error=str(exc),
                attempt=1,
            )
            raise AIServiceError(provider=provider.provider_name, message=str(exc)) from exc

        duration_ms = now_ms() - start_ms
        log_ai_response(
            provider=provider.provider_name,
            model=response.model,
            request_id=request_id,
            duration_ms=duration_ms,
            tokens_used=response.usage.total_tokens,
        )

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
        )

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
        provider   = get_provider(
            AIProvider(request.provider) if request.provider else None
        )
        model      = request.model or provider.default_model

        log_ai_request(
            provider=provider.provider_name,
            model=model,
            request_id=request_id,
            extra={
                "session_id":    request.session_id,
                "history_turns": len(request.history),
                "client_id":     client_id,
                "streaming":     True,
            },
        )

        start_ms = now_ms()

        try:
            async for chunk in self._stream_from_provider(provider, request, request_id):
                yield chunk
        except AIServiceError as exc:
            error_chunk = StreamChunkDTO(
                event=StreamEventType.ERROR,
                request_id=request_id,
                error=exc.message,
            )
            yield f"data: {error_chunk.model_dump_json()}\n\n"
            return
        except Exception as exc:
            log_ai_error(
                provider=provider.provider_name,
                model=model,
                request_id=request_id,
                error=str(exc),
                attempt=1,
            )
            error_chunk = StreamChunkDTO(
                event=StreamEventType.ERROR,
                request_id=request_id,
                error="An unexpected error occurred.",
            )
            yield f"data: {error_chunk.model_dump_json()}\n\n"
            return

        log_ai_response(
            provider=provider.provider_name,
            model=model,
            request_id=request_id,
            duration_ms=now_ms() - start_ms,
        )

    async def _stream_from_provider(
        self,
        provider,
        request: PortfolioChatRequest,
        request_id: str,
    ) -> AsyncGenerator[str, None]:
        """
        Calls the OpenAI streaming API directly.
        When other providers are implemented, this delegates to provider.stream().
        """
        from openai import AsyncOpenAI  # type: ignore

        if not settings.OPENAI_API_KEY:
            from app.services.exceptions import AINotConfiguredError
            raise AINotConfiguredError(
                provider="openai",
                message="OPENAI_API_KEY is not set.",
            )

        client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.OPENAI_TIMEOUT_SECONDS,
            max_retries=0,
        )

        messages = [
            {"role": m.role.value, "content": m.content}
            for m in _to_provider_messages(request)
        ]

        stream = await client.chat.completions.create(
            model=request.model or settings.OPENAI_DEFAULT_MODEL,
            messages=messages,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            temperature=settings.OPENAI_TEMPERATURE,
            stream=True,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                payload = StreamChunkDTO(
                    event=StreamEventType.DELTA,
                    request_id=request_id,
                    content=delta.content,
                )
                yield f"data: {payload.model_dump_json()}\n\n"

        done_chunk = StreamChunkDTO(
            event=StreamEventType.DONE,
            request_id=request_id,
            provider=provider.provider_name,
            model=request.model or settings.OPENAI_DEFAULT_MODEL,
        )
        yield f"data: {done_chunk.model_dump_json()}\n\n"

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
