// frontend/src/services/ai/ai.client.ts
// Thin HTTP client for the ai-service.
// API keys never exist in the frontend — they live in ai-service/.env only.
// The frontend only knows the ai-service base URL (VITE_AI_SERVICE_URL).

import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type {
  ChatRequest,
  ChatResponse,
  CompletionRequest,
  CompletionResponse,
  HealthResponse,
  AIErrorResponse,
} from './ai.types'
import { AIClientError } from './ai.types'

// ── Config ────────────────────────────────────────────────────────────────────

const AI_SERVICE_URL =
  (import.meta.env.VITE_AI_SERVICE_URL as string | undefined) ||
  'http://localhost:8000'

const API_BASE = `${AI_SERVICE_URL}/api/v1/ai`

// ── Axios instance ────────────────────────────────────────────────────────────

function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE,
    timeout: 35_000,
    headers: { 'Content-Type': 'application/json' },
  })

  // Response interceptor — normalise errors into AIClientError
  instance.interceptors.response.use(
    (res) => res,
    (err: AxiosError<AIErrorResponse>) => {
      const data        = err.response?.data
      const statusCode  = err.response?.status

      if (data && data.error) {
        throw new AIClientError(
          data.error,
          data.message,
          data.request_id,
          data.retry_after,
          statusCode,
        )
      }

      // Network / timeout errors
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        throw new AIClientError('TIMEOUT', 'Request to AI service timed out.', undefined, undefined, statusCode)
      }

      throw new AIClientError('UNKNOWN', err.message || 'Unknown error.', undefined, undefined, statusCode)
    },
  )

  return instance
}

const _http = createAxiosInstance()

// ── Public API ────────────────────────────────────────────────────────────────

export const aiClient = {
  /**
   * Multi-turn chat completion.
   * Pass context_key to scope the conversation (e.g. 'portfolio_chat').
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { data } = await _http.post<ChatResponse>('/chat', request)
    return data
  },

  /**
   * Single-turn text completion.
   */
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const { data } = await _http.post<CompletionResponse>('/complete', request)
    return data
  },

  /**
   * Check which providers are configured and available.
   */
  async health(): Promise<HealthResponse> {
    const { data } = await _http.get<HealthResponse>('/health')
    return data
  },
}
