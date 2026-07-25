# ai-service/app/routers/chat_router.py
# Portfolio chat endpoint.
#
# POST /api/v1/chat  — non-streaming JSON response
# POST /api/v1/chat  — SSE stream when request.stream == true
#
# Auth hook: when authentication is added, extract the principal from the
# JWT in the Authorization header here and pass it as client_id.
# The _client_id() helper is the single place to change.

import logging

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import ValidationError

from app.chat.chat_service import get_chat_service
from app.chat.dtos import PortfolioChatRequest, PortfolioChatResponse
from app.models.ai_models import AIErrorCode, AIErrorResponse
from app.core.logging import generate_request_id

logger = logging.getLogger("ai.chat.router")

router = APIRouter(prefix="/chat", tags=["Chat"])


def _client_id(request: Request) -> str:
    """
    Derives a stable client identifier for rate limiting and logging.

    Auth hook: replace this body with JWT claim extraction when auth is added.
    Example:
        token = request.headers.get("Authorization", "").removeprefix("Bearer ")
        payload = decode_jwt(token)
        return payload.get("sub", "anonymous")
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "anonymous"


@router.post(
    "",
    summary="Portfolio AI chat",
    description=(
        "Send a message to the portfolio AI assistant. "
        "Set `stream: true` to receive a Server-Sent Events stream. "
        "Include `history` for multi-turn conversations."
    ),
    responses={
        200: {"description": "Chat response (JSON or SSE stream)"},
        400: {"model": AIErrorResponse, "description": "Validation error"},
        429: {"model": AIErrorResponse, "description": "Rate limit exceeded"},
        502: {"model": AIErrorResponse, "description": "AI provider error"},
        503: {"model": AIErrorResponse, "description": "Provider not configured"},
    },
)
async def chat(request: Request, body: PortfolioChatRequest):
    client_id  = _client_id(request)
    request_id = getattr(request.state, "request_id", generate_request_id())
    service    = get_chat_service()

    logger.info(
        "Chat request received",
        extra={
            "request_id":    request_id,
            "client_id":     client_id,
            "session_id":    body.session_id,
            "stream":        body.stream,
            "history_turns": len(body.history),
            "message_len":   len(body.message),
        },
    )

    if body.stream:
        return StreamingResponse(
            service.stream(body, client_id=client_id),
            media_type="text/event-stream",
            headers={
                "Cache-Control":     "no-cache",
                "X-Accel-Buffering": "no",   # disable Nginx buffering for SSE
                "X-Request-ID":      request_id,
            },
        )

    response: PortfolioChatResponse = await service.chat(body, client_id=client_id)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=response.model_dump(),
        headers={"X-Request-ID": request_id},
    )
