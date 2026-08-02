# ai-service/app/core/retry.py
# Exponential backoff retry strategy.
# Used by all AI providers — provider-agnostic.

import asyncio
import logging
from typing import Callable, TypeVar, Optional
try:
    from typing import ParamSpec
except ImportError:
    from typing_extensions import ParamSpec

from app.core.config import get_settings

logger = logging.getLogger("ai.retry")
settings = get_settings()

P = ParamSpec("P")
T = TypeVar("T")

# Errors that should NEVER be retried (permanent failures)
_NON_RETRYABLE_SIGNALS = [
    "quota exceeded",
    "free tier",
    "billing",
    "api key",
    "unauthenticated",
    "permission_denied",
    "invalid api key",
]

# Errors worth retrying (transient)
_RETRYABLE_SIGNALS = [
    "rate limit",
    "timeout",
    "connection",
    "temporarily unavailable",
    "service unavailable",
    "overloaded",
    "too many requests",
    "internal server error",
]


def is_retryable_error(exc: Exception) -> bool:
    """Determine if an exception is transient and worth retrying."""
    from app.services.exceptions import AINotConfiguredError, AIQuotaExceededError
    # Never retry configuration or quota errors
    if isinstance(exc, (AINotConfiguredError, AIQuotaExceededError)):
        return False
    msg = str(exc).lower()
    if any(s in msg for s in _NON_RETRYABLE_SIGNALS):
        return False
    return any(s in msg for s in _RETRYABLE_SIGNALS)


async def with_retry(
    fn: Callable[P, T],
    *args: P.args,
    **kwargs: P.kwargs,
) -> T:
    """
    Execute an async callable with exponential backoff retry.
    Reads max_attempts, base_delay, max_delay from settings.
    """
    max_attempts = settings.RETRY_MAX_ATTEMPTS
    base_delay   = settings.RETRY_BASE_DELAY_SECONDS
    max_delay    = settings.RETRY_MAX_DELAY_SECONDS
    exp_base     = settings.RETRY_EXPONENTIAL_BASE

    last_exc: Optional[Exception] = None

    for attempt in range(1, max_attempts + 1):
        try:
            return await fn(*args, **kwargs)  # type: ignore[return-value]
        except Exception as exc:
            last_exc = exc

            if not is_retryable_error(exc) or attempt == max_attempts:
                raise

            delay = min(base_delay * (exp_base ** (attempt - 1)), max_delay)
            logger.warning(
                "Retrying AI call",
                extra={
                    "attempt": attempt,
                    "max_attempts": max_attempts,
                    "delay_seconds": delay,
                    "error": str(exc),
                },
            )
            await asyncio.sleep(delay)

    raise last_exc  # type: ignore[misc]
