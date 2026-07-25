# ai-service/app/providers/anthropic_provider.py
# Anthropic Claude provider — stub implementation.
# Interface is complete. Fill in the API calls when you add Anthropic support.
# Requires: pip install anthropic

from app.core.config import get_settings
from app.models.ai_models import (
    AIProvider, ChatRequest, ChatResponse,
    CompletionRequest, CompletionResponse, ProviderStatus,
)
from app.providers.base import BaseAIProvider
from app.services.exceptions import AINotConfiguredError, AIServiceError

settings = get_settings()


class AnthropicProvider(BaseAIProvider):

    @property
    def provider_name(self) -> str:
        return "anthropic"

    @property
    def default_model(self) -> str:
        return settings.ANTHROPIC_DEFAULT_MODEL

    @property
    def is_configured(self) -> bool:
        return bool(settings.ANTHROPIC_API_KEY)

    async def chat(self, request: ChatRequest) -> ChatResponse:
        if not self.is_configured:
            raise AINotConfiguredError(
                provider="anthropic",
                message="ANTHROPIC_API_KEY is not set.",
            )
        # TODO: implement using `anthropic` SDK
        # from anthropic import AsyncAnthropic
        # client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        # response = await client.messages.create(...)
        raise NotImplementedError("Anthropic provider not yet implemented")

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        raise NotImplementedError("Anthropic provider not yet implemented")

    def get_status(self) -> ProviderStatus:
        return ProviderStatus(
            provider=AIProvider.ANTHROPIC,
            configured=self.is_configured,
            model=self.default_model,
        )
