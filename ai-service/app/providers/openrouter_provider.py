# ai-service/app/providers/openrouter_provider.py
# OpenRouter provider — OpenAI-compatible API with free model tier.
# Uses openai SDK with custom base_url + required HTTP-Referer header.

import logging
from typing import Any

from app.core.config import get_settings
from app.core.logging import generate_request_id, log_ai_error, log_ai_request, log_ai_response, now_ms
from app.models.ai_models import (
    AIProvider, ChatRequest, ChatResponse,
    CompletionRequest, CompletionResponse,
    ProviderStatus, TokenUsage,
)
from app.providers.base import BaseAIProvider
from app.services.exceptions import AINotConfiguredError, AIQuotaExceededError, AIServiceError, AITimeoutError

logger   = logging.getLogger("ai.provider.openrouter")
settings = get_settings()

_QUOTA_SIGNALS   = ("quota", "429", "rate_limit", "rate limit", "too many requests", "credits", "resource_exhausted")
_AUTH_SIGNALS    = ("api key", "401", "403", "unauthenticated", "invalid_api_key", "no auth")
_TIMEOUT_SIGNALS = ("timeout", "deadline", "timed out")


def _classify_error(exc: Exception) -> AIServiceError:
    msg = str(exc).lower()
    if any(s in msg for s in _QUOTA_SIGNALS):
        return AIQuotaExceededError(provider="openrouter")
    if any(s in msg for s in _AUTH_SIGNALS):
        return AINotConfiguredError(provider="openrouter", message="OpenRouter API key is invalid or missing.")
    if any(s in msg for s in _TIMEOUT_SIGNALS):
        return AITimeoutError(provider="openrouter")
    return AIServiceError(provider="openrouter", message=str(exc))


class OpenRouterProvider(BaseAIProvider):

    def __init__(self) -> None:
        self._client: Any = None

    @property
    def provider_name(self) -> str:
        return "openrouter"

    @property
    def default_model(self) -> str:
        return settings.OPENROUTER_DEFAULT_MODEL

    @property
    def is_configured(self) -> bool:
        return bool(settings.OPENROUTER_API_KEY)

    def _get_client(self) -> Any:
        if self._client is None:
            if not self.is_configured:
                raise AINotConfiguredError(
                    provider="openrouter",
                    message="OPENROUTER_API_KEY is not set. Add it to ai-service/.env",
                )
            try:
                from openai import AsyncOpenAI  # type: ignore
            except ImportError as e:
                raise AIServiceError(provider="openrouter",
                                     message="openai package not installed.") from e
            self._client = AsyncOpenAI(
                api_key=settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1",
                default_headers={
                    "HTTP-Referer": "https://yashranjan.dev",
                    "X-Title": "Yash Ranjan Portfolio",
                },
                timeout=30,
                max_retries=0,
            )
            logger.info("OpenRouter provider initialised", extra={"model": settings.OPENROUTER_DEFAULT_MODEL})
        return self._client

    async def chat(self, request: ChatRequest) -> ChatResponse:
        client     = self._get_client()
        model      = request.model or self.default_model
        request_id = generate_request_id()
        start_ms   = now_ms()

        log_ai_request(provider=self.provider_name, model=model, request_id=request_id,
                       extra={"message_count": len(request.messages)})

        try:
            messages = [{"role": m.role.value, "content": m.content} for m in request.messages]
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
            )
        except AIServiceError:
            raise
        except Exception as exc:
            log_ai_error(provider=self.provider_name, model=model, request_id=request_id, error=str(exc), attempt=1)
            raise _classify_error(exc) from exc

        duration_ms = now_ms() - start_ms
        choice      = response.choices[0]
        usage       = response.usage

        log_ai_response(provider=self.provider_name, model=model, request_id=request_id,
                        duration_ms=duration_ms, tokens_used=usage.total_tokens if usage else None)

        return ChatResponse(
            request_id=request_id,
            provider=AIProvider.OPENROUTER,
            model=response.model,
            content=choice.message.content or "",
            usage=TokenUsage(
                prompt_tokens=usage.prompt_tokens if usage else None,
                completion_tokens=usage.completion_tokens if usage else None,
                total_tokens=usage.total_tokens if usage else None,
            ),
            duration_ms=duration_ms,
            finish_reason=choice.finish_reason,
        )

    async def stream(self, request: ChatRequest, request_id: str):
        """Async generator yielding text chunks."""
        client   = self._get_client()
        model    = request.model or self.default_model
        messages = [{"role": m.role.value, "content": m.content} for m in request.messages]
        try:
            stream = await client.chat.completions.create(
                model=model, messages=messages,
                max_tokens=request.max_tokens, temperature=request.temperature,
                stream=True,
            )
        except Exception as exc:
            raise _classify_error(exc) from exc

        async for chunk in stream:
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta and delta.content:
                yield delta.content

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        from app.models.ai_models import ChatMessage, MessageRole, ChatRequest as CR
        chat_req  = CR(messages=[ChatMessage(role=MessageRole.USER, content=request.prompt)],
                       model=request.model, max_tokens=request.max_tokens, temperature=request.temperature)
        chat_resp = await self.chat(chat_req)
        return CompletionResponse(request_id=chat_resp.request_id, provider=chat_resp.provider,
                                  model=chat_resp.model, content=chat_resp.content,
                                  usage=chat_resp.usage, duration_ms=chat_resp.duration_ms)

    def get_status(self) -> ProviderStatus:
        return ProviderStatus(provider=AIProvider.OPENROUTER, configured=self.is_configured, model=self.default_model)
