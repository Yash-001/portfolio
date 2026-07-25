# ai-service/app/providers/base.py
# Abstract base class for all AI providers.
# Every provider (OpenAI, Anthropic, Gemini) must implement this interface.
# The service layer only ever talks to this interface — never to a concrete provider.

from abc import ABC, abstractmethod

from app.models.ai_models import (
    ChatRequest,
    ChatResponse,
    CompletionRequest,
    CompletionResponse,
    ProviderStatus,
)


class BaseAIProvider(ABC):
    """
    Contract for all AI provider implementations.

    To add a new provider:
    1. Create app/providers/<name>.py
    2. Subclass BaseAIProvider
    3. Implement all abstract methods
    4. Register in app/providers/registry.py
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Canonical provider name, e.g. 'openai'."""
        ...

    @property
    @abstractmethod
    def default_model(self) -> str:
        """Default model identifier for this provider."""
        ...

    @property
    @abstractmethod
    def is_configured(self) -> bool:
        """True if the required API key / credentials are present."""
        ...

    @abstractmethod
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """
        Multi-turn conversation completion.
        Must raise AIServiceError on failure (never return an error response).
        """
        ...

    @abstractmethod
    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        """
        Single-turn text completion.
        Must raise AIServiceError on failure.
        """
        ...

    @abstractmethod
    def get_status(self) -> ProviderStatus:
        """Return current configuration status for health checks."""
        ...
