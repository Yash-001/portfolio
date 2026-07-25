# ai-service/app/routers/ai_router.py
from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse

from app.models.ai_models import (
    ChatRequest,
    ChatResponse,
    CompletionRequest,
    CompletionResponse,
    HealthResponse,
)
from app.services.ai_service import get_ai_service

router = APIRouter(prefix="/ai", tags=["AI"])


def _client_id(request: Request) -> str:
    """Extract a stable client identifier for rate limiting."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "anonymous"


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Multi-turn chat completion",
)
async def chat(request: Request, body: ChatRequest) -> ChatResponse:
    return await get_ai_service().chat(body, client_id=_client_id(request))


@router.post(
    "/complete",
    response_model=CompletionResponse,
    status_code=status.HTTP_200_OK,
    summary="Single-turn text completion",
)
async def complete(request: Request, body: CompletionRequest) -> CompletionResponse:
    return await get_ai_service().complete(body, client_id=_client_id(request))


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Provider health and configuration status",
)
async def health() -> HealthResponse:
    return get_ai_service().health()
