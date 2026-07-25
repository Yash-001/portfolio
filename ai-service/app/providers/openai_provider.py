# ai-service/app/providers/openai_provider.py
# OpenAI provider implementation.
# Reads OPENAI_API_KEY from settings — never from code.

import logging
from typing import Any

from app.core.config import get_settings
from app.core.logging import (
    generate_request_id,
    log_ai_request,
    log_ai_response,
    log_ai_error,
    now_ms,
)
from app.models.ai_models import (
    AIProvider,
    ChatMessage,
    ChatRequest,
    ChatResponse,
    CompletionRequest,
    CompletionResponse,
    MessageRole,
    ProviderStatus,
    TokenUsage,
)
from app.providers.base import BaseAIProvider
from app.services.exceptions import AIServiceError, AINotConfiguredError

logger = logging.getLogger("ai.provider.openai")
settings = get_settings()


class OpenAIProvider(BaseAIProvider):

    def __init__(self) -> None:
        self._client: Any = None  # lazy-initialised

    @property
    def provider_name(self) -> str:
        return "openai"

    @property
    def default_model(self) -> str:
        return settings.OPENAI_DEFAULT_MODEL

    @property
    def is_configured(self) -> bool:
        return bool(settings.OPENAI_API_KEY)

    def _get_client(self) -> Any:
        """Lazy-init the AsyncOpenAI client so import errors surface clearly."""
        if self._client is None:
            if not self.is_configured:
                raise AINotConfiguredError(
                    provider="openai",
                    message="OPENAI_API_KEY is not set. Add it to ai-service/.env",
                )
            try:
                from openai import AsyncOpenAI  # type: ignore
            except ImportError as e:
                raise AIServiceError(
                    provider="openai",
                    message="openai package not installed. Run: pip install openai",
                ) from e

            self._client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY,
                timeout=settings.OPENAI_TIMEOUT_SECONDS,
                max_retries=0,  # retries handled by our own retry layer
            )
        return self._client

    def _build_messages(self, messages: list) -> list:
        return [{"role": m.role.value, "content": m.content} for m in messages]

    async def chat(self, request: ChatRequest) -> ChatResponse:
        client     = self._get_client()
        model      = request.model or self.default_model
        request_id = generate_request_id()
        start_ms   = now_ms()

        log_ai_request(
            provider=self.provider_name,
            model=model,
            request_id=request_id,
            extra={"message_count": len(request.messages), "context_key": request.context_key},
        )

        try:
            response = await client.chat.completions.create(
                model=model,
                messages=self._build_messages(request.messages),
                max_tokens=request.max_tokens,
                temperature=request.temperature,
            )
        except Exception as exc:
            log_ai_error(
                provider=self.provider_name,
                model=model,
                request_id=request_id,
                error=str(exc),
                attempt=1,
            )
            raise AIServiceError(
                provider="openai",
                message=str(exc),
            ) from exc

        duration_ms = now_ms() - start_ms
        choice      = response.choices[0]
        usage       = response.usage

        log_ai_response(
            provider=self.provider_name,
            model=model,
            request_id=request_id,
            duration_ms=duration_ms,
            tokens_used=usage.total_tokens if usage else None,
        )

        return ChatResponse(
            request_id=request_id,
            provider=AIProvider.OPENAI,
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

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        """Wraps single-turn completion as a chat call internally."""
        from app.models.ai_models import ChatMessage, MessageRole

        chat_req = ChatRequest(
            messages=[ChatMessage(role=MessageRole.USER, content=request.prompt)],
            provider=request.provider,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            context_key=request.context_key,
        )
        chat_resp = await self.chat(chat_req)
        return CompletionResponse(
            request_id=chat_resp.request_id,
            provider=chat_resp.provider,
            model=chat_resp.model,
            content=chat_resp.content,
            usage=chat_resp.usage,
            duration_ms=chat_resp.duration_ms,
        )

    def get_status(self) -> ProviderStatus:
        return ProviderStatus(
            provider=AIProvider.OPENAI,
            configured=self.is_configured,
            model=self.default_model,
        )
