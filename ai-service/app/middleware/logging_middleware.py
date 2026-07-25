# ai-service/app/middleware/logging_middleware.py
import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("ai.http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        start      = time.time()

        request.state.request_id = request_id

        response = await call_next(request)

        duration_ms = int((time.time() - start) * 1000)
        logger.info(
            "HTTP request",
            extra={
                "request_id": request_id,
                "method":     request.method,
                "path":       request.url.path,
                "status":     response.status_code,
                "duration_ms": duration_ms,
            },
        )
        response.headers["X-Request-ID"] = request_id
        return response
