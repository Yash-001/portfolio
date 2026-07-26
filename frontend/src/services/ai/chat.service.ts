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

/** Timeout for the initial HTTP connection (not the full stream duration). */
const CONNECT_TIMEOUT_MS = 15_000

/** Timeout for the full non-streaming response. */
const REQUEST_TIMEOUT_MS = 30_000

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

// ── Offline detection ──────────────────────────────────────────────────────

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

function offlineError(): Error {
  const e = new Error('You appear to be offline. Please check your connection.')
  e.name = 'OfflineError'
  return e
}

// ── Timeout helper ─────────────────────────────────────────────────────────

/**
 * Returns an AbortSignal that fires after `ms` milliseconds.
 * Falls back gracefully if AbortSignal.timeout is not available (Safari <16).
 */
function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms)
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), ms)
  return controller.signal
}

/**
 * Combines two AbortSignals — aborts when either fires.
 * Uses AbortSignal.any() when available (Chrome 116+, Firefox 124+),
 * falls back to a manual listener approach.
 */
function combineSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any([a, b])
  }
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (a.aborted || b.aborted) { controller.abort(); return controller.signal }
  a.addEventListener('abort', abort, { once: true })
  b.addEventListener('abort', abort, { once: true })
  return controller.signal
}

// ── Non-streaming ──────────────────────────────────────────────────────────

/** Non-streaming chat call. */
export async function sendChat(payload: ChatPayload): Promise<ChatResult> {
  if (isOffline()) throw offlineError()

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, stream: false }),
    signal: timeoutSignal(REQUEST_TIMEOUT_MS),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `HTTP ${res.status}`)
  }

  return res.json()
}

// ── Streaming ──────────────────────────────────────────────────────────────

/**
 * Streaming chat call via SSE.
 * Calls onDelta for each content chunk, onDone when complete, onError on failure.
 * Returns an AbortController so the caller can cancel mid-stream.
 *
 * Timeout behaviour:
 *  - CONNECT_TIMEOUT_MS applies to the initial HTTP handshake only.
 *  - Once streaming starts the timeout is cleared — long responses are fine.
 */
export function streamChat(
  payload: ChatPayload,
  onDelta: (chunk: string) => void,
  onDone: (requestId: string, suggestedQuestions?: string[]) => void,
  onError: (message: string) => void,
): AbortController {
  const userController = new AbortController()

  ;(async () => {
    if (isOffline()) {
      onError('You appear to be offline. Please check your connection.')
      return
    }

    // Connect-phase timeout — cancelled as soon as the response headers arrive
    const connectController = new AbortController()
    const connectTimer = setTimeout(
      () => connectController.abort(new DOMException('Connection timed out', 'TimeoutError')),
      CONNECT_TIMEOUT_MS,
    )

    let res: Response
    try {
      res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, stream: true }),
        signal: combineSignals(userController.signal, connectController.signal),
      })
    } catch (err: unknown) {
      clearTimeout(connectTimer)
      if ((err as Error)?.name === 'AbortError') return
      if ((err as Error)?.name === 'TimeoutError') {
        onError('Connection timed out. The AI service may be starting up — please try again.')
        return
      }
      // Network failure (DNS, refused, offline race)
      onError(
        isOffline()
          ? 'You appear to be offline. Please check your connection.'
          : (err as Error)?.message || 'Connection failed',
      )
      return
    }

    // Headers received — cancel the connect timeout, streaming can take as long as needed
    clearTimeout(connectTimer)

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      onError(errBody.message || `HTTP ${res.status}`)
      return
    }

    const reader = res.body?.getReader()
    if (!reader) { onError('No response body'); return }

    const decoder = new TextDecoder()
    let buffer = ''
    let lastRequestId = ''

    // Abort the reader when the user cancels
    userController.signal.addEventListener('abort', () => {
      reader.cancel().catch(() => {})
    }, { once: true })

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

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
      reader.releaseLock()
    }

    onDone(lastRequestId, undefined)
  })()

  return userController
}
