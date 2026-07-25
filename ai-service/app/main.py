# ai-service/app/main.py
# FastAPI application factory.
# Wires config, logging, CORS, middleware, error handlers, and routers.

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.models.ai_models import AIErrorCode, AIErrorResponse

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.middleware.error_handler import ai_service_error_handler, generic_error_handler
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.routers.ai_router import router as ai_router
from app.routers.chat_router import router as chat_router
from app.services.exceptions import AIServiceError

setup_logging()

settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
    )

    # ── CORS ──────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "X-Request-ID"],
    )

    # ── Request logging ───────────────────────────────────────────────────
    app.add_middleware(RequestLoggingMiddleware)

    # ── Error handlers ────────────────────────────────────────────────────
    app.add_exception_handler(AIServiceError, ai_service_error_handler)  # type: ignore
    app.add_exception_handler(Exception, generic_error_handler)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request, exc: RequestValidationError):
        from app.core.logging import generate_request_id
        request_id = getattr(request.state, "request_id", generate_request_id())
        return JSONResponse(
            status_code=422,
            content=AIErrorResponse(
                error=AIErrorCode.INVALID_REQUEST,
                message=str(exc.errors()),
                request_id=request_id,
            ).model_dump(),
            headers={"X-Request-ID": request_id},
        )

    # ── Routers ───────────────────────────────────────────────────────────
    app.include_router(ai_router, prefix="/api/v1")
    app.include_router(chat_router, prefix="/api/v1")

    # ── Root ──────────────────────────────────────────────────────────────
    @app.get("/", include_in_schema=False)
    async def root():
        return {"service": settings.APP_NAME, "version": settings.APP_VERSION}

    return app


app = create_app()
