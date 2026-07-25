// src/services/ai/chat.service.ts
// Portfolio chat service — handles both streaming (SSE) and non-streaming calls.
// API keys never touch the frontend. Only VITE_AI_SERVICE_URL is used.

const AI_BASE =
  (import.meta.env.VITE_AI_SERVICE_URL as string | undefined) ||
  'http://localhost:8000'

// Warn in production if the AI service URL was not explicitly configured.
if (import.meta.env.PROD && !import.meta.env.VITE_AI_SERVICE_URL) {
  console.warn('[AI] VITE_AI_SERVICE_URL is not set. Falling back to localhost:8000 — this will not work in production.')
}

const CHAT_URL = `${AI_BASE}/api/v1/chat`

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatPayload {
  message: string
  history: ConversationMessage[]
  stream: boolean
  session_id?: string
}

export interface StreamChunk {
  event: 'delta' | 'done' | 'error'
  request_id: string
  content?: string
  provider?: string
  model?: string
  error?: string
  suggested_questions?: string[]
}

export interface ChatResult {
  request_id: string
  content: string
  provider: string
  model: string
  duration_ms: number
}

/** Non-streaming chat call. */
export async function sendChat(payload: ChatPayload): Promise<ChatResult> {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, stream: false }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `HTTP ${res.status}`)
  }

  return res.json()
}

/**
 * Streaming chat call via SSE.
 * Calls onDelta for each content chunk, onDone when complete, onError on failure.
 * Returns an AbortController so the caller can cancel mid-stream.
 */
export function streamChat(
  payload: ChatPayload,
  onDelta: (chunk: string) => void,
  onDone: (requestId: string, suggestedQuestions?: string[]) => void,
  onError: (message: string) => void,
): AbortController {
  const controller = new AbortController()

  ;(async () => {
    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, stream: true }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        onError(err.message || `HTTP ${res.status}`)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) { onError('No response body'); return }

      const decoder = new TextDecoder()
      let buffer = ''
      let lastRequestId = ''

      try {
        let reading = true
        while (reading) {
          const { done, value } = await reader.read()
          if (done) { reading = false; break }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (!raw) continue

            try {
              const chunk: StreamChunk = JSON.parse(raw)
              lastRequestId = chunk.request_id

              if (chunk.event === 'delta' && chunk.content) {
                onDelta(chunk.content)
              } else if (chunk.event === 'done') {
                onDone(lastRequestId, chunk.suggested_questions)
                return
              } else if (chunk.event === 'error') {
                onError(chunk.error || 'Stream error')
                return
              }
            } catch {
              // malformed chunk — skip
            }
          }
        }
      } finally {
        // Always release the reader lock, even on early return or abort
        reader.releaseLock()
      }

      onDone(lastRequestId, undefined)
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return
      onError((err as Error)?.message || 'Connection failed')
    }
  })()

  return controller
}
