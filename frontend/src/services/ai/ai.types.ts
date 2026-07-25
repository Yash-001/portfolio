// frontend/src/services/ai/ai.types.ts
// TypeScript types that mirror the ai-service Pydantic models.
// Keep in sync with ai-service/app/models/ai_models.py.

// ── Enums ─────────────────────────────────────────────────────────────────────

export type AIProvider = 'openai' | 'anthropic' | 'gemini'
export type MessageRole = 'system' | 'user' | 'assistant'
export type AIErrorCode =
  | 'PROVIDER_ERROR'
  | 'RATE_LIMITED'
  | 'INVALID_REQUEST'
  | 'PROVIDER_UNAVAILABLE'
  | 'NOT_CONFIGURED'
  | 'TIMEOUT'
  | 'UNKNOWN'

// ── Messages ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role:    MessageRole
  content: string
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface ChatRequest {
  messages:    ChatMessage[]
  provider?:   AIProvider
  model?:      string
  max_tokens?: number
  temperature?: number
  stream?:     boolean
  context_key?: string
  metadata?:   Record<string, unknown>
}

export interface CompletionRequest {
  prompt:      string
  provider?:   AIProvider
  model?:      string
  max_tokens?: number
  temperature?: number
  context_key?: string
}

// ── Responses ─────────────────────────────────────────────────────────────────

export interface TokenUsage {
  prompt_tokens?:     number
  completion_tokens?: number
  total_tokens?:      number
}

export interface ChatResponse {
  request_id:    string
  provider:      AIProvider
  model:         string
  content:       string
  usage:         TokenUsage
  duration_ms:   number
  finish_reason?: string
}

export interface CompletionResponse {
  request_id:  string
  provider:    AIProvider
  model:       string
  content:     string
  usage:       TokenUsage
  duration_ms: number
}

// ── Health ────────────────────────────────────────────────────────────────────

export interface ProviderStatus {
  provider:   AIProvider
  configured: boolean
  model:      string
}

export interface HealthResponse {
  status:    'ok' | 'degraded'
  version:   string
  providers: ProviderStatus[]
}

// ── Errors ────────────────────────────────────────────────────────────────────

export interface AIErrorResponse {
  error:        AIErrorCode
  message:      string
  request_id?:  string
  retry_after?: number
}

export class AIClientError extends Error {
  constructor(
    public readonly code:       AIErrorCode,
    message:                    string,
    public readonly requestId?: string,
    public readonly retryAfter?: number,
    public readonly statusCode?: number,
  ) {
    super(message)
    this.name = 'AIClientError'
  }
}
