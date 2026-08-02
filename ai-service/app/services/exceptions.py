# ai-service/app/services/exceptions.py
# Typed exceptions for the AI service layer.
# Providers raise these; the router catches them and maps to HTTP responses.

from __future__ import annotations

from app.models.ai_models import AIErrorCode


class AIServiceError(Exception):
    """Base exception for all AI service errors."""

    def __init__(
        self,
        provider: str,
        message: str,
        error_code: AIErrorCode = AIErrorCode.PROVIDER_ERROR,
        retry_after: float | None = None,
    ) -> None:
        super().__init__(message)
        self.provider    = provider
        self.message     = message
        self.error_code  = error_code
        self.retry_after = retry_after


class AINotConfiguredError(AIServiceError):
    def __init__(self, provider: str, message: str) -> None:
        super().__init__(
            provider=provider,
            message=message,
            error_code=AIErrorCode.NOT_CONFIGURED,
        )


class AIRateLimitError(AIServiceError):
    def __init__(self, provider: str, retry_after: float = 60.0) -> None:
        super().__init__(
            provider=provider,
            message=f"Rate limit exceeded for provider '{provider}'.",
            error_code=AIErrorCode.RATE_LIMITED,
            retry_after=retry_after,
        )


class AITimeoutError(AIServiceError):
    def __init__(self, provider: str) -> None:
        super().__init__(
            provider=provider,
            message=f"Request to provider '{provider}' timed out.",
            error_code=AIErrorCode.TIMEOUT,
        )


class AIQuotaExceededError(AIServiceError):
    def __init__(self, provider: str, retry_after: float = 3600.0) -> None:
        super().__init__(
            provider=provider,
            message=f"AI service is temporarily busy. Free tier quota exhausted for provider '{provider}'. Please try again later.",
            error_code=AIErrorCode.RATE_LIMITED,
            retry_after=retry_after,
        )


class AIProviderUnavailableError(AIServiceError):
    def __init__(self, provider: str) -> None:
        super().__init__(
            provider=provider,
            message=f"Provider '{provider}' is temporarily unavailable.",
            error_code=AIErrorCode.PROVIDER_UNAVAILABLE,
        )
