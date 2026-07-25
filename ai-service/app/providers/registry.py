# ai-service/app/providers/registry.py
# Provider registry — the only place that knows about concrete provider classes.
# To add a new provider: import it here and add it to _REGISTRY.

from app.core.config import get_settings
from app.models.ai_models import AIProvider
from app.providers.base import BaseAIProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.gemini_provider import GeminiProvider
from app.services.exceptions import AIServiceError
from typing import Dict, List, Optional, Union

settings = get_settings()

_REGISTRY: Dict[str, BaseAIProvider] = {
    AIProvider.OPENAI:    OpenAIProvider(),
    AIProvider.ANTHROPIC: AnthropicProvider(),
    AIProvider.GEMINI:    GeminiProvider(),
}


def get_provider(name: Optional[Union[str, AIProvider]] = None) -> BaseAIProvider:
    """
    Return the provider instance for the given name.
    Falls back to DEFAULT_AI_PROVIDER from settings if name is None.
    """
    resolved = str(name or settings.DEFAULT_AI_PROVIDER)
    provider = _REGISTRY.get(resolved)
    if provider is None:
        raise AIServiceError(
            provider=resolved,
            message=f"Unknown AI provider '{resolved}'. Valid options: {list(_REGISTRY.keys())}",
        )
    return provider


def get_all_providers() -> List[BaseAIProvider]:
    return list(_REGISTRY.values())
