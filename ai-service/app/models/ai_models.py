# ai-service/app/models/ai_models.py
# Pydantic models for all AI request/response contracts.
# These are the shapes that cross the HTTP boundary.

from __future__ import annotations

from enum import Enum
from typing import Any, Literal
from pydantic import BaseModel, Field, field_validator


# ── Enums ─────────────────────────────────────────────────────────────────────

class AIProvider(str, Enum):
    OPENAI    = "openai"
    ANTHROPIC = "anthropic"
    GEMINI    = "gemini"


class MessageRole(str, Enum):
    SYSTEM    = "system"
    USER      = "user"
    ASSISTANT = "assistant"


# ── Message ───────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role:    MessageRole
    content: str = Field(..., min_length=1, max_length=32_000)


# ── Requests ──────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    messages:     list[ChatMessage] = Field(..., min_length=1, max_length=50)
    provider:     AIProvider | None = None          # None → use DEFAULT_AI_PROVIDER
    model:        str | None        = None          # None → use provider default
    max_tokens:   int               = Field(default=1024, ge=1, le=8192)
    temperature:  float             = Field(default=0.7, ge=0.0, le=2.0)
    stream:       bool              = False
    context_key:  str | None        = None          # e.g. "portfolio_chat", "resume_qa"
    metadata:     dict[str, Any]    = Field(default_factory=dict)

    @field_validator("messages")
    @classmethod
    def last_message_must_be_user(cls, v: list[ChatMessage]) -> list[ChatMessage]:
        if v and v[-1].role != MessageRole.USER:
            raise ValueError("Last message must have role 'user'")
        return v


class CompletionRequest(BaseModel):
    """Single-turn text completion (no conversation history)."""
    prompt:      str   = Field(..., min_length=1, max_length=16_000)
    provider:    AIProvider | None = None
    model:       str | None        = None
    max_tokens:  int               = Field(default=512, ge=1, le=4096)
    temperature: float             = Field(default=0.7, ge=0.0, le=2.0)
    context_key: str | None        = None


# ── Responses ─────────────────────────────────────────────────────────────────

class TokenUsage(BaseModel):
    prompt_tokens:     int | None = None
    completion_tokens: int | None = None
    total_tokens:      int | None = None


class ChatResponse(BaseModel):
    request_id:   str
    provider:     AIProvider
    model:        str
    content:      str
    usage:        TokenUsage
    duration_ms:  int
    finish_reason: str | None = None


class CompletionResponse(BaseModel):
    request_id:  str
    provider:    AIProvider
    model:       str
    content:     str
    usage:       TokenUsage
    duration_ms: int


# ── Errors ────────────────────────────────────────────────────────────────────

class AIErrorCode(str, Enum):
    PROVIDER_ERROR       = "PROVIDER_ERROR"
    RATE_LIMITED         = "RATE_LIMITED"
    INVALID_REQUEST      = "INVALID_REQUEST"
    PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE"
    NOT_CONFIGURED       = "NOT_CONFIGURED"
    TIMEOUT              = "TIMEOUT"
    UNKNOWN              = "UNKNOWN"


class AIErrorResponse(BaseModel):
    error:      AIErrorCode
    message:    str
    request_id: str | None = None
    retry_after: float | None = None   # seconds, present when RATE_LIMITED


# ── Health ────────────────────────────────────────────────────────────────────

class ProviderStatus(BaseModel):
    provider:    AIProvider
    configured:  bool
    model:       str


class HealthResponse(BaseModel):
    status:    Literal["ok", "degraded"]
    version:   str
    providers: list[ProviderStatus]
