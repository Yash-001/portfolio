# ai-service/app/core/logging.py
# Structured logging with JSON output for production.
# Provides hooks for AI request/response logging without leaking content.

import logging
import sys
import time
import uuid
from typing import Any, Dict, Optional

from app.core.config import get_settings

settings = get_settings()


def _build_formatter() -> logging.Formatter:
    if settings.LOG_FORMAT == "json":
        try:
            import json_log_formatter  # type: ignore
            return json_log_formatter.JSONFormatter()
        except ImportError:
            pass  # fall through to text formatter
    return logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )


def setup_logging() -> None:
    """Call once at application startup."""
    root = logging.getLogger()
    root.setLevel(settings.LOG_LEVEL)

    if root.handlers:
        root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(_build_formatter())
    root.addHandler(handler)

    # Silence noisy third-party loggers
    for noisy in ("httpx", "httpcore", "openai._base_client"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


# ── AI request/response logging hooks ────────────────────────────────────────
# These are the ONLY places AI content should be logged.
# In production LOG_AI_RESPONSES should be False.

def log_ai_request(
    provider: str,
    model: str,
    request_id: str,
    extra: Optional[Dict[str, Any]] = None,
) -> None:
    if not settings.LOG_AI_REQUESTS:
        return
    logger = get_logger("ai.request")
    logger.info(
        "AI request dispatched",
        extra={
            "provider": provider,
            "model": model,
            "request_id": request_id,
            **(extra or {}),
        },
    )


def log_ai_response(
    provider: str,
    model: str,
    request_id: str,
    duration_ms: int,
    tokens_used: Optional[int] = None,
    extra: Optional[Dict[str, Any]] = None,
) -> None:
    logger = get_logger("ai.response")
    logger.info(
        "AI response received",
        extra={
            "provider": provider,
            "model": model,
            "request_id": request_id,
            "duration_ms": duration_ms,
            "tokens_used": tokens_used,
            **(extra or {}),
        },
    )


def log_ai_error(
    provider: str,
    model: str,
    request_id: str,
    error: str,
    attempt: int,
) -> None:
    logger = get_logger("ai.error")
    logger.error(
        "AI request failed: %s",
        error,
        extra={
            "provider": provider,
            "model": model,
            "request_id": request_id,
            "error": error,
            "attempt": attempt,
        },
    )


def generate_request_id() -> str:
    return str(uuid.uuid4())


def now_ms() -> int:
    return int(time.time() * 1000)
