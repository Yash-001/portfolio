# ai-service/app/core/retry.py
# Exponential backoff retry strategy.
# Used by all AI providers — provider-agnostic.

import asyncio
import functools
import logging
from typing import Callable, TypeVar, ParamSpec

from app.core.config import get_settings

logger = logging.getLogger("ai.retry")
settings = get_settings()

P = ParamSpec("P")
T = TypeVar("T")

# Errors that are worth retrying (transient)
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


def is_retryable_error(exc: Exception) -> bool:
    """Determine if an exception is transient and worth retrying."""
    msg = str(exc).lower()
    transient_signals = [
        "rate limit",
        "timeout",
        "connection",
        "temporarily unavailable",
        "service unavailable",
        "overloaded",
        "too many requests",
        "internal server error",
    ]
    return any(signal in msg for signal in transient_signals)


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

    last_exc: Exception | None = None

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
