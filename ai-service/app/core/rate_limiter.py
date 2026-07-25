# ai-service/app/core/rate_limiter.py
# In-memory sliding window rate limiter.
# Swap the storage backend for Redis when scaling horizontally.
# Hook is called by the AI service layer before every provider call.

import time
import logging
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Dict, Deque, Optional

from app.core.config import get_settings

logger = logging.getLogger("ai.rate_limiter")
settings = get_settings()


@dataclass
class RateLimitResult:
    allowed: bool
    remaining_minute: int
    remaining_hour: int
    retry_after_seconds: float = 0.0


class SlidingWindowRateLimiter:
    """
    Per-client sliding window rate limiter.
    client_id is typically the request IP or an API key hash.
    """

    def __init__(
        self,
        requests_per_minute: int,
        requests_per_hour: int,
    ) -> None:
        self._rpm = requests_per_minute
        self._rph = requests_per_hour
        # client_id → deque of timestamps
        self._minute_windows: Dict[str, Deque[float]] = defaultdict(deque)
        self._hour_windows:   Dict[str, Deque[float]] = defaultdict(deque)

    def check(self, client_id: str) -> RateLimitResult:
        if not settings.RATE_LIMIT_ENABLED:
            return RateLimitResult(allowed=True, remaining_minute=self._rpm, remaining_hour=self._rph)

        now = time.time()
        self._evict(client_id, now)

        minute_count = len(self._minute_windows[client_id])
        hour_count   = len(self._hour_windows[client_id])

        if minute_count >= self._rpm:
            oldest = self._minute_windows[client_id][0]
            retry_after = 60.0 - (now - oldest)
            logger.warning("Rate limit hit (per-minute)", extra={"client_id": client_id})
            return RateLimitResult(
                allowed=False,
                remaining_minute=0,
                remaining_hour=max(0, self._rph - hour_count),
                retry_after_seconds=max(0.0, retry_after),
            )

        if hour_count >= self._rph:
            oldest = self._hour_windows[client_id][0]
            retry_after = 3600.0 - (now - oldest)
            logger.warning("Rate limit hit (per-hour)", extra={"client_id": client_id})
            return RateLimitResult(
                allowed=False,
                remaining_minute=max(0, self._rpm - minute_count),
                remaining_hour=0,
                retry_after_seconds=max(0.0, retry_after),
            )

        self._minute_windows[client_id].append(now)
        self._hour_windows[client_id].append(now)

        return RateLimitResult(
            allowed=True,
            remaining_minute=self._rpm - minute_count - 1,
            remaining_hour=self._rph - hour_count - 1,
        )

    def _evict(self, client_id: str, now: float) -> None:
        """Remove timestamps outside the current window."""
        mw = self._minute_windows[client_id]
        while mw and now - mw[0] > 60:
            mw.popleft()

        hw = self._hour_windows[client_id]
        while hw and now - hw[0] > 3600:
            hw.popleft()


# ── Singleton ─────────────────────────────────────────────────────────────────
_limiter: Optional[SlidingWindowRateLimiter] = None


def get_rate_limiter() -> SlidingWindowRateLimiter:
    global _limiter
    if _limiter is None:
        _limiter = SlidingWindowRateLimiter(
            requests_per_minute=settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
            requests_per_hour=settings.RATE_LIMIT_REQUESTS_PER_HOUR,
        )
    return _limiter
