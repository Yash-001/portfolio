# ai-service/app/models/ai_models.py
# Pydantic models for all AI request/response contracts.
# Uses Optional[] for Python 3.9 compatibility with Pydantic v2.

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


# ── Enums ─────────────────────────────────────────────────────────────────────

class AIProvider(str, Enum):
    OPENAI      = "openai"
    ANTHROPIC   = "anthropic"
    GEMINI      = "gemini"
    GROQ        = "groq"
    OPENROUTER  = "openrouter"


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
    messages:     List[ChatMessage] = Field(..., min_length=1, max_length=50)
    provider:     Optional[AIProvider] = None
    model:        Optional[str]        = None
    max_tokens:   int                  = Field(default=1024, ge=1, le=8192)
    temperature:  float                = Field(default=0.7, ge=0.0, le=2.0)
    stream:       bool                 = False
    context_key:  Optional[str]        = None
    metadata:     Dict[str, Any]       = Field(default_factory=dict)

    @field_validator("messages")
    @classmethod
    def last_message_must_be_user(cls, v: List[ChatMessage]) -> List[ChatMessage]:
        if v and v[-1].role != MessageRole.USER:
            raise ValueError("Last message must have role 'user'")
        return v


class CompletionRequest(BaseModel):
    prompt:      str              = Field(..., min_length=1, max_length=16_000)
    provider:    Optional[AIProvider] = None
    model:       Optional[str]        = None
    max_tokens:  int              = Field(default=512, ge=1, le=4096)
    temperature: float            = Field(default=0.7, ge=0.0, le=2.0)
    context_key: Optional[str]    = None


# ── Responses ─────────────────────────────────────────────────────────────────

class TokenUsage(BaseModel):
    prompt_tokens:     Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens:      Optional[int] = None


class ChatResponse(BaseModel):
    request_id:    str
    provider:      AIProvider
    model:         str
    content:       str
    usage:         TokenUsage
    duration_ms:   int
    finish_reason: Optional[str] = None


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
    error:       AIErrorCode
    message:     str
    request_id:  Optional[str]   = None
    retry_after: Optional[float] = None


# ── Health ────────────────────────────────────────────────────────────────────

class ProviderStatus(BaseModel):
    provider:   AIProvider
    configured: bool
    model:      str


class HealthResponse(BaseModel):
    status:    Literal["ok", "degraded"]
    version:   str
    providers: List[ProviderStatus]
