# ai-service/app/chat/dtos.py
# Production DTOs for the portfolio chat endpoint.
# Uses Optional[] for Python 3.9 compatibility with Pydantic v2.

from __future__ import annotations

from enum import Enum
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


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

    @field_validator("history")
    @classmethod
    def history_must_alternate(cls, v: List[ConversationMessage]) -> List[ConversationMessage]:
        for i in range(1, len(v)):
            if v[i].role == v[i - 1].role:
                raise ValueError(
                    f"Conversation history must alternate roles. "
                    f"Found consecutive '{v[i].role}' at positions {i-1} and {i}."
                )
        return v

    @model_validator(mode="after")
    def history_last_must_be_assistant(self) -> PortfolioChatRequest:
        if self.history and self.history[-1].role != ConversationRole.ASSISTANT:
            raise ValueError(
                "Last message in history must be from the assistant. "
                "The current user message is sent separately in 'message'."
            )
        return self


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
