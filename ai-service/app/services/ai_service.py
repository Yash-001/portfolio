# ai-service/app/services/ai_service.py
# Orchestration layer between routers and providers.
# Responsibilities: rate limit check, provider resolution, retry, error normalisation.
# Routers call this service — never providers directly.

import logging

from app.core.rate_limiter import get_rate_limiter
from app.core.retry import with_retry
from app.models.ai_models import (
    ChatRequest,
    ChatResponse,
    CompletionRequest,
    CompletionResponse,
    HealthResponse,
    ProviderStatus,
)
from app.providers.registry import get_provider, get_all_providers
from app.services.exceptions import AIRateLimitError, AIServiceError

logger = logging.getLogger("ai.service")


class AIService:

    async def chat(
        self,
        request: ChatRequest,
        client_id: str = "anonymous",
    ) -> ChatResponse:
        self._check_rate_limit(client_id)
        provider = get_provider(request.provider)

        async def _call() -> ChatResponse:
            return await provider.chat(request)

        return await with_retry(_call)

    async def complete(
        self,
        request: CompletionRequest,
        client_id: str = "anonymous",
    ) -> CompletionResponse:
        self._check_rate_limit(client_id)
        provider = get_provider(request.provider)

        async def _call() -> CompletionResponse:
            return await provider.complete(request)

        return await with_retry(_call)

    def health(self) -> HealthResponse:
        statuses: list[ProviderStatus] = [p.get_status() for p in get_all_providers()]
        any_configured = any(s.configured for s in statuses)
        return HealthResponse(
            status="ok" if any_configured else "degraded",
            version="1.0.0",
            providers=statuses,
        )

    def _check_rate_limit(self, client_id: str) -> None:
        result = get_rate_limiter().check(client_id)
        if not result.allowed:
            raise AIRateLimitError(
                provider="service",
                retry_after=result.retry_after_seconds,
            )


# ── Singleton ─────────────────────────────────────────────────────────────────
_ai_service: 'AIService | None' = None


def get_ai_service() -> AIService:
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
