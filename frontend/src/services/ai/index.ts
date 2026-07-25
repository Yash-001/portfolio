// frontend/src/services/ai/index.ts
export { aiClient } from './ai.client'
export type {
  AIProvider,
  MessageRole,
  AIErrorCode,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  CompletionRequest,
  CompletionResponse,
  TokenUsage,
  HealthResponse,
  ProviderStatus,
  AIErrorResponse,
} from './ai.types'
export { AIClientError } from './ai.types'
