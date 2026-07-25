// src/stores/chat.store.ts
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { streamChat } from '@/services/ai/chat.service'
import {
  trimHistory,
  buildContextHint,
  saveSession,
  loadSession,
  deleteSession,
  exportConversation,
  generateFollowUps,
} from '@/services/ai/conversation.service'
import type { PersistedSession } from '@/services/ai/conversation.service'

export type MessageStatus = 'sending' | 'streaming' | 'done' | 'error'

export interface ChatMessageItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  status: MessageStatus
  error?: string
  requestId?: string
  timestamp: Date
}

// ── Session ID ────────────────────────────────────────────────────────────────
// Stable per browser tab; persisted to localStorage for session restore.
const STORAGE_SESSION_KEY = 'ai_chat_active_session'

function makeSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function getOrCreateSessionId(): string {
  try {
    return localStorage.getItem(STORAGE_SESSION_KEY) || makeSessionId()
  } catch (_e) {
    return makeSessionId()
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useChatStore = defineStore('chat', () => {
  const isOpen        = ref(false)
  const messages      = ref<ChatMessageItem[]>([])
  const isStreaming   = ref(false)
  const isLoading     = ref(false)
  const followUps     = ref<string[]>([])
  const sessionId     = ref<string>(getOrCreateSessionId())

  let _abortController: AbortController | null = null

  // ── Computed ──────────────────────────────────────────────────────────────
  const hasMessages = computed(() => messages.value.length > 0)
  const canSend     = computed(() => !isStreaming.value && !isLoading.value)
  const lastMessage = computed(() =>
    messages.value.length ? messages.value[messages.value.length - 1] : null,
  )
  const messageCount = computed(() => messages.value.filter(m => m.status === 'done').length)

  // ── Session persistence ───────────────────────────────────────────────────
  function _persistSession(): void {
    if (!messages.value.length) return
    const session: PersistedSession = {
      id:         sessionId.value,
      messages:   messages.value,
      createdAt:  messages.value[0]?.timestamp?.toISOString() ?? new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
    }
    saveSession(session)
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, sessionId.value)
    } catch (_e) { /* quota exceeded */ }
  }

  function restoreSession(): boolean {
    const session = loadSession(sessionId.value)
    if (!session || !session.messages.length) return false
    // Re-hydrate Date objects (JSON serialization loses them)
    messages.value = session.messages.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }))
    followUps.value = generateFollowUps(messages.value)
    return true
  }

  // Auto-persist only when a message reaches a terminal state (done/error),
  // not on every streaming delta — avoids thrashing localStorage.
  watch(
    () => messages.value.filter(m => m.status === 'done' || m.status === 'error').length,
    _persistSession,
  )

  // ── Dialog ────────────────────────────────────────────────────────────────
  function open()   { isOpen.value = true  }
  function close()  { isOpen.value = false }
  function toggle() { isOpen.value = !isOpen.value }

  // ── Send ──────────────────────────────────────────────────────────────────
  async function send(text: string): Promise<void> {
    if (!canSend.value || !text.trim()) return

    followUps.value = []

    const userMsg: ChatMessageItem = {
      id:        `u_${Date.now()}`,
      role:      'user',
      content:   text.trim(),
      status:    'done',
      timestamp: new Date(),
    }
    messages.value.push(userMsg)

    const assistantMsg: ChatMessageItem = {
      id:        `a_${Date.now()}`,
      role:      'assistant',
      content:   '',
      status:    'streaming',
      timestamp: new Date(),
    }
    messages.value.push(assistantMsg)

    // Always mutate via reactive array index — never via the local reference.
    // The local reference is a plain object; mutations to it bypass Vue's proxy.
    const assistantIdx = messages.value.length - 1

    const priorMessages = messages.value.slice(0, -2)
    const history = trimHistory(priorMessages)
    const contextHint = buildContextHint(messages.value)
    const messageWithHint = contextHint ? `${contextHint}\n\n${text.trim()}` : text.trim()

    isStreaming.value = true

    _abortController = streamChat(
      { message: messageWithHint, history, stream: true, session_id: sessionId.value },
      (chunk) => {
        messages.value[assistantIdx].content += chunk
      },
      (requestId, serverFollowUps) => {
        messages.value[assistantIdx].status    = 'done'
        messages.value[assistantIdx].requestId = requestId
        isStreaming.value  = false
        _abortController   = null
        followUps.value = serverFollowUps?.length
          ? serverFollowUps
          : generateFollowUps(messages.value)
      },
      (errMsg) => {
        messages.value[assistantIdx].status = 'error'
        messages.value[assistantIdx].error  = errMsg
        isStreaming.value = false
        _abortController  = null
      },
    )
  }

  // ── Retry ─────────────────────────────────────────────────────────────────
  async function retry(): Promise<void> {
    const msgs = messages.value
    const lastIdx = msgs.length - 1
    if (lastIdx < 0) return
    const last = msgs[lastIdx]
    if (!last || last.role !== 'assistant' || last.status !== 'error') return

    // Find the user message immediately before this assistant message
    const userMsg = lastIdx > 0 && msgs[lastIdx - 1].role === 'user'
      ? msgs[lastIdx - 1]
      : null
    if (!userMsg) return

    messages.value.pop() // remove failed assistant message
    await send(userMsg.content)
  }

  // ── Cancel ────────────────────────────────────────────────────────────────
  function cancel(): void {
    _abortController?.abort()
    _abortController = null
    const last = messages.value[messages.value.length - 1]
    if (last?.status === 'streaming') {
      last.status = last.content ? 'done' : 'error'
      if (!last.content) last.error = 'Cancelled'
    }
    isStreaming.value = false
  }

  // ── Reset (new conversation) ──────────────────────────────────────────────
  function reset(): void {
    cancel()
    // Archive current session before starting fresh
    _persistSession()
    // New session
    sessionId.value = makeSessionId()
    try { localStorage.setItem(STORAGE_SESSION_KEY, sessionId.value) } catch (_e) { /* quota exceeded */ }
    messages.value  = []
    followUps.value = []
  }

  /** Clear messages without creating a new session (legacy clear). */
  function clear(): void {
    cancel()
    deleteSession(sessionId.value)
    messages.value  = []
    followUps.value = []
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function exportChat(format: 'txt' | 'md' = 'md'): void {
    exportConversation(messages.value, format)
  }

  return {
    isOpen, messages, isStreaming, isLoading,
    followUps, sessionId, messageCount,
    hasMessages, canSend, lastMessage,
    open, close, toggle,
    send, retry, cancel, clear, reset,
    exportChat, restoreSession,
  }
})
