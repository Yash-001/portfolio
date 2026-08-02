# ai-service/app/providers/registry.py
# Provider registry — the only place that knows about concrete provider classes.
# To add a new provider: import it here and add it to _REGISTRY.

import logging
from typing import Dict, List, Optional, Union

from app.core.config import get_settings
from app.models.ai_models import AIProvider
from app.providers.base import BaseAIProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.groq_provider import GroqProvider
from app.providers.openrouter_provider import OpenRouterProvider
from app.services.exceptions import AIServiceError

logger   = logging.getLogger("ai.registry")
settings = get_settings()

_REGISTRY: Dict[str, BaseAIProvider] = {
    AIProvider.OPENAI:      OpenAIProvider(),
    AIProvider.ANTHROPIC:   AnthropicProvider(),
    AIProvider.GEMINI:      GeminiProvider(),
    AIProvider.GROQ:        GroqProvider(),
    AIProvider.OPENROUTER:  OpenRouterProvider(),
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


def get_provider_chain() -> List[BaseAIProvider]:
    """
    Return an ordered list of configured providers to try for failover.

    - AI_PROVIDER_MODE=auto  → use AI_PROVIDER_PRIORITY order, skip unconfigured
    - AI_PROVIDER_MODE=single → return only DEFAULT_AI_PROVIDER
    """
    if settings.AI_PROVIDER_MODE == "single":
        return [get_provider(settings.DEFAULT_AI_PROVIDER)]

    priority = [p.strip() for p in settings.AI_PROVIDER_PRIORITY.split(",") if p.strip()]
    chain: List[BaseAIProvider] = []
    for name in priority:
        provider = _REGISTRY.get(name)
        if provider is None:
            logger.warning("Unknown provider in AI_PROVIDER_PRIORITY: %s — skipping", name)
            continue
        if not provider.is_configured:
            logger.debug("Provider '%s' not configured (no API key) — skipping", name)
            continue
        chain.append(provider)

    if not chain:
        raise AIServiceError(
            provider="none",
            message="No AI providers are configured. Set at least one API key (GROQ_API_KEY, OPENROUTER_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY).",
        )

    logger.info("Provider chain: %s", [p.provider_name for p in chain])
    return chain


def get_all_providers() -> List[BaseAIProvider]:
    return list(_REGISTRY.values())
