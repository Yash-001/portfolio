# ai-service/app/providers/gemini_provider.py
# Google Gemini provider — full implementation.
# Uses google-generativeai SDK. Supports both chat and streaming.
# Switch to Gemini by setting DEFAULT_AI_PROVIDER=gemini in .env

import logging
from typing import Any, List, Optional

from app.core.config import get_settings
from app.core.logging import generate_request_id, log_ai_error, log_ai_request, log_ai_response, now_ms
from app.models.ai_models import (
    AIProvider, ChatRequest, ChatResponse,
    CompletionRequest, CompletionResponse,
    MessageRole, ProviderStatus, TokenUsage,
)
from app.providers.base import BaseAIProvider
from app.services.exceptions import AINotConfiguredError, AIServiceError

logger = logging.getLogger("ai.provider.gemini")
settings = get_settings()


def _to_gemini_history(messages: list) -> List[dict]:
    """
    Convert ChatMessage list to Gemini history format.
    Gemini uses 'user'/'model' roles (not 'assistant').
    System message is handled separately via system_instruction.
    """
    history = []
    for m in messages:
        if m.role == MessageRole.SYSTEM:
            continue  # handled via system_instruction
        role = "model" if m.role == MessageRole.ASSISTANT else "user"
        history.append({"role": role, "parts": [{"text": m.content}]})
    return history


def _get_system_instruction(messages: list) -> Optional[str]:
    """Extract system message content if present."""
    for m in messages:
        if m.role == MessageRole.SYSTEM:
            return m.content
    return None


class GeminiProvider(BaseAIProvider):

    def __init__(self) -> None:
        self._genai: Any = None  # lazy-initialised

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def default_model(self) -> str:
        return settings.GEMINI_DEFAULT_MODEL

    @property
    def is_configured(self) -> bool:
        return bool(settings.GEMINI_API_KEY)

    def _get_genai(self) -> Any:
        """Lazy-init google.generativeai and configure API key."""
        if self._genai is None:
            if not self.is_configured:
                raise AINotConfiguredError(
                    provider="gemini",
                    message="GEMINI_API_KEY is not set. Add it to ai-service/.env",
                )
            try:
                import google.generativeai as genai  # type: ignore
            except ImportError as e:
                raise AIServiceError(
                    provider="gemini",
                    message="google-generativeai not installed. Run: pip install google-generativeai",
                ) from e
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._genai = genai
        return self._genai

    async def chat(self, request: ChatRequest) -> ChatResponse:
        genai     = self._get_genai()
        model_id  = request.model or self.default_model
        request_id = generate_request_id()
        start_ms  = now_ms()

        log_ai_request(
            provider=self.provider_name,
            model=model_id,
            request_id=request_id,
            extra={"message_count": len(request.messages)},
        )

        try:
            system_instruction = _get_system_instruction(request.messages)
            history = _to_gemini_history(request.messages[:-1])  # all but last
            last_message = request.messages[-1].content

            model = genai.GenerativeModel(
                model_name=model_id,
                system_instruction=system_instruction,
                generation_config=genai.GenerationConfig(
                    max_output_tokens=request.max_tokens,
                    temperature=request.temperature,
                ),
            )
            chat_session = model.start_chat(history=history)
            response = await chat_session.send_message_async(last_message)
            try:
                content = response.text or ""
            except ValueError:
                content = ""

        except AIServiceError:
            raise
        except Exception as exc:
            log_ai_error(
                provider=self.provider_name,
                model=model_id,
                request_id=request_id,
                error=str(exc),
                attempt=1,
            )
            raise AIServiceError(provider="gemini", message=str(exc)) from exc

        duration_ms = now_ms() - start_ms
        log_ai_response(
            provider=self.provider_name,
            model=model_id,
            request_id=request_id,
            duration_ms=duration_ms,
        )

        return ChatResponse(
            request_id=request_id,
            provider=AIProvider.GEMINI,
            model=model_id,
            content=content,
            usage=TokenUsage(),  # Gemini usage metadata varies by version
            duration_ms=duration_ms,
            finish_reason="stop",
        )

    async def stream(self, request: ChatRequest, request_id: str):
        """
        Async generator yielding (content_chunk: str) strings.
        Called by ChatService._stream_from_provider when provider is gemini.
        """
        genai    = self._get_genai()
        model_id = request.model or self.default_model

        system_instruction = _get_system_instruction(request.messages)
        history = _to_gemini_history(request.messages[:-1])
        last_message = request.messages[-1].content

        model = genai.GenerativeModel(
            model_name=model_id,
            system_instruction=system_instruction,
            generation_config=genai.GenerationConfig(
                max_output_tokens=request.max_tokens,
                temperature=request.temperature,
            ),
        )
        chat_session = model.start_chat(history=history)
        response = await chat_session.send_message_async(last_message, stream=True)

        async for chunk in response:
            try:
                text = chunk.text
            except (ValueError, AttributeError):
                continue
            if text:
                yield text

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        from app.models.ai_models import ChatMessage, MessageRole, ChatRequest as CR
        chat_req = CR(
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
            provider=AIProvider.GEMINI,
            configured=self.is_configured,
            model=self.default_model,
        )
