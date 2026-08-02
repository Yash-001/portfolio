# ai-service/app/middleware/error_handler.py
import logging
import uuid

from fastapi import Request
from fastapi.responses import JSONResponse

from app.models.ai_models import AIErrorCode, AIErrorResponse
from app.services.exceptions import (
    AINotConfiguredError,
    AIQuotaExceededError,
    AIRateLimitError,
    AIServiceError,
    AITimeoutError,
)

logger = logging.getLogger("ai.error_handler")


async def ai_service_error_handler(request: Request, exc: AIServiceError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))

    logger.error(
        "AI service error: %s",
        exc.message,
        extra={
            "request_id": request_id,
            "error_code": exc.error_code,
            "provider":   exc.provider,
        },
    )

    if isinstance(exc, AINotConfiguredError):
        status_code = 503
    elif isinstance(exc, (AIRateLimitError, AIQuotaExceededError)):
        status_code = 429
    elif isinstance(exc, AITimeoutError):
        status_code = 504
    else:
        status_code = 502

    body = AIErrorResponse(
        error=exc.error_code,
        message=exc.message,
        request_id=request_id,
        retry_after=exc.retry_after,
    )

    headers = {}
    if exc.retry_after:
        headers["Retry-After"] = str(int(exc.retry_after))

    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(),
        headers=headers,
    )


async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.exception("Unhandled exception", extra={"request_id": request_id})
    return JSONResponse(
        status_code=500,
        content=AIErrorResponse(
            error=AIErrorCode.UNKNOWN,
            message="An unexpected error occurred.",
            request_id=request_id,
        ).model_dump(),
    )
