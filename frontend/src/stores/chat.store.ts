// src/stores/chat.store.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { streamChat } from '@/services/ai/chat.service'
import type { ConversationMessage } from '@/services/ai/chat.service'

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

const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`

export const useChatStore = defineStore('chat', () => {
  const isOpen      = ref(false)
  const messages    = ref<ChatMessageItem[]>([])
  const isStreaming = ref(false)
  const isLoading   = ref(false)

  let _abortController: AbortController | null = null

  // ── Computed ──────────────────────────────────────────────────────────────
  const hasMessages   = computed(() => messages.value.length > 0)
  const canSend       = computed(() => !isStreaming.value && !isLoading.value)
  const historyForApi = computed((): ConversationMessage[] =>
    messages.value
      .filter(m => m.status === 'done' && (m.role === 'user' || m.role === 'assistant'))
      .map(m => ({ role: m.role, content: m.content }))
  )

  // ── Dialog ────────────────────────────────────────────────────────────────
  function open()  { isOpen.value = true  }
  function close() { isOpen.value = false }
  function toggle() { isOpen.value = !isOpen.value }

  // ── Send ──────────────────────────────────────────────────────────────────
  async function send(text: string): Promise<void> {
    if (!canSend.value || !text.trim()) return

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

    const history = historyForApi.value.slice(0, -1) // exclude the just-added user msg

    isStreaming.value = true

    _abortController = streamChat(
      { message: text.trim(), history, stream: true, session_id: SESSION_ID },
      // onDelta
      (chunk) => {
        assistantMsg.content += chunk
      },
      // onDone
      (requestId) => {
        assistantMsg.status    = 'done'
        assistantMsg.requestId = requestId
        isStreaming.value      = false
        _abortController       = null
      },
      // onError
      (errMsg) => {
        assistantMsg.status  = 'error'
        assistantMsg.error   = errMsg
        isStreaming.value    = false
        _abortController     = null
      },
    )
  }

  /** Retry the last failed assistant message. */
  async function retry(): Promise<void> {
    const last = messages.value[messages.value.length - 1]
    if (!last || last.role !== 'assistant' || last.status !== 'error') return

    // Find the user message that triggered it
    const userMsg = [...messages.value].reverse().find(m => m.role === 'user')
    if (!userMsg) return

    // Remove the failed assistant message and resend
    messages.value.pop()
    await send(userMsg.content)
  }

  /** Cancel an in-progress stream. */
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

  /** Clear all messages. */
  function clear(): void {
    cancel()
    messages.value = []
  }

  return {
    isOpen, messages, isStreaming, isLoading,
    hasMessages, canSend,
    open, close, toggle,
    send, retry, cancel, clear,
  }
})
