# ai-service/app/core/config.py
# All configuration is read from environment variables.
# Never hardcode API keys or secrets here.

from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Service identity ──────────────────────────────────────────────────
    APP_NAME: str = "Portfolio AI Service"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    # Renamed from DEBUG to APP_DEBUG to avoid collision with the Windows
    # system environment variable DEBUG=release set by some IDEs/tools.
    APP_DEBUG: bool = False

    # ── Server ────────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── CORS ──────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins, e.g. "http://localhost:5173,https://yourdomain.com"
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    # ── AI Provider selection ─────────────────────────────────────────────
    DEFAULT_AI_PROVIDER: str = "groq"
    AI_PROVIDER_MODE: str = "auto"
    AI_PROVIDER_PRIORITY: str = "groq,openrouter,gemini,openai"

    # ── OpenAI ────────────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    OPENAI_DEFAULT_MODEL: str = "gpt-4o-mini"
    OPENAI_MAX_TOKENS: int = 1024
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_TIMEOUT_SECONDS: int = 30

    # ── Anthropic (future) ────────────────────────────────────────────────
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_DEFAULT_MODEL: str = "claude-3-haiku-20240307"
    ANTHROPIC_MAX_TOKENS: int = 1024

    # ── Google Gemini ─────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GEMINI_DEFAULT_MODEL: str = "gemini-3.5-flash-lite"

    # ── Groq ──────────────────────────────────────────────────────────────
    GROQ_API_KEY: str = ""
    GROQ_DEFAULT_MODEL: str = "qwen/qwen3.8-27b"

    # ── OpenRouter ────────────────────────────────────────────────────────
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_DEFAULT_MODEL: str = "meta-llama/llama-3.1-8b-instruct:free"

    # ── Rate limiting ─────────────────────────────────────────────────────
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 20
    RATE_LIMIT_REQUESTS_PER_HOUR: int = 100

    # ── Retry strategy ────────────────────────────────────────────────────
    RETRY_MAX_ATTEMPTS: int = 3
    RETRY_BASE_DELAY_SECONDS: float = 1.0
    RETRY_MAX_DELAY_SECONDS: float = 10.0
    RETRY_EXPONENTIAL_BASE: float = 2.0

    # ── Logging ───────────────────────────────────────────────────────────
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    LOG_FORMAT: Literal["json", "text"] = "json"
    LOG_AI_REQUESTS: bool = True
    LOG_AI_RESPONSES: bool = False

    # ── Chat ──────────────────────────────────────────────────────────────
    CHAT_MAX_HISTORY_TURNS: int = 20
    CHAT_MAX_MESSAGE_LENGTH: int = 4_000

    # ── Reviews / clients database ────────────────────────────────────────
    DB_PATH: str = "portfolio.db"
    REVIEW_MIN_LENGTH: int = 20
    REVIEW_MAX_LENGTH: int = 300
    # Set a strong random value in production .env — empty disables admin routes
    ADMIN_API_KEY: str = ""
    # Per-IP rate limit for public review endpoints (per hour)
    REVIEW_RATE_LIMIT_PER_HOUR: int = 10

    # ── Auth (future) ─────────────────────────────────────────────────────
    # Set AUTH_ENABLED=true and provide JWT_SECRET when auth is added.
    AUTH_ENABLED: bool = False
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton — call get_settings() anywhere."""
    return Settings()
