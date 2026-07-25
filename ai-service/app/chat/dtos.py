# ai-service/app/chat/dtos.py
# Production DTOs for the portfolio chat endpoint.
# Uses Optional[] for Python 3.9 compatibility with Pydantic v2.

from __future__ import annotations

from enum import Enum
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


# ── Conversation history ──────────────────────────────────────────────────────

class ConversationRole(str, Enum):
    USER      = "user"
    ASSISTANT = "assistant"


class ConversationMessage(BaseModel):
    role:    ConversationRole
    content: str = Field(..., min_length=1, max_length=8_000)


# ── Request ───────────────────────────────────────────────────────────────────

class PortfolioChatRequest(BaseModel):
    """
    Inbound DTO for POST /api/v1/chat.

    message    — current user message (required).
    history    — prior turns for multi-turn context (optional, max 20 turns).
    stream     — stream response via SSE (default: false).
    provider   — override default AI provider (optional).
    model      — override default model (optional).
    session_id — opaque client-generated ID for log correlation. Not used for auth.
    """
    message:    str = Field(..., min_length=1, max_length=4_500)  # +500 for context hint
    history:    List[ConversationMessage] = Field(default_factory=list, max_length=20)
    stream:     bool = Field(default=False)
    provider:   Optional[Literal["openai", "anthropic", "gemini"]] = None
    model:      Optional[str] = Field(default=None, max_length=100)
    session_id: Optional[str] = Field(default=None, max_length=128)

    # History shape is normalised server-side in _trim_history() before
    # being sent to the provider. No strict validators here — they caused
    # 422s when the client sent edge-case history shapes (e.g. single user
    # message, or history from session restore).


# ── Response ──────────────────────────────────────────────────────────────────

class TokenUsageDTO(BaseModel):
    prompt_tokens:     Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens:      Optional[int] = None


class PortfolioChatResponse(BaseModel):
    request_id:          str
    session_id:          Optional[str]
    content:             str
    provider:            str
    model:               str
    usage:               TokenUsageDTO
    duration_ms:         int
    finish_reason:       Optional[str] = None
    suggested_questions: Optional[List[str]] = None


# ── Streaming ─────────────────────────────────────────────────────────────────

class StreamEventType(str, Enum):
    DELTA = "delta"
    DONE  = "done"
    ERROR = "error"


class StreamChunkDTO(BaseModel):
    event:      StreamEventType
    request_id: str
    content:    Optional[str]          = None
    provider:   Optional[str]          = None
    model:      Optional[str]          = None
    usage:      Optional[TokenUsageDTO] = None
    error:      Optional[str]          = None
    # Sent with the 'done' event so the frontend can show follow-up chips
    suggested_questions: Optional[List[str]] = None
