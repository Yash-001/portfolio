# ai-service/app/providers/gemini_provider.py
# Google Gemini provider — stub implementation.
# Interface is complete. Fill in the API calls when you add Gemini support.
# Requires: pip install google-generativeai

from app.core.config import get_settings
from app.models.ai_models import (
    AIProvider, ChatRequest, ChatResponse,
    CompletionRequest, CompletionResponse, ProviderStatus,
)
from app.providers.base import BaseAIProvider
from app.services.exceptions import AINotConfiguredError

settings = get_settings()


class GeminiProvider(BaseAIProvider):

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def default_model(self) -> str:
        return settings.GEMINI_DEFAULT_MODEL

    @property
    def is_configured(self) -> bool:
        return bool(settings.GEMINI_API_KEY)

    async def chat(self, request: ChatRequest) -> ChatResponse:
        if not self.is_configured:
            raise AINotConfiguredError(
                provider="gemini",
                message="GEMINI_API_KEY is not set.",
            )
        # TODO: implement using `google-generativeai` SDK
        # import google.generativeai as genai
        # genai.configure(api_key=settings.GEMINI_API_KEY)
        # model = genai.GenerativeModel(request.model or self.default_model)
        # response = await model.generate_content_async(...)
        raise NotImplementedError("Gemini provider not yet implemented")

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        raise NotImplementedError("Gemini provider not yet implemented")

    def get_status(self) -> ProviderStatus:
        return ProviderStatus(
            provider=AIProvider.GEMINI,
            configured=self.is_configured,
            model=self.default_model,
        )
