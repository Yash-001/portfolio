// src/services/ai/conversation.service.ts
// Context window management, session persistence, deduplication, and export.

import type { ConversationMessage } from './chat.service'
import type { ChatMessageItem } from '@/stores/chat.store'

// ── Constants ─────────────────────────────────────────────────────────────────

/** Max turns sent to the API. Each turn = 1 user + 1 assistant message. */
const MAX_HISTORY_TURNS = 10

/** Approx token budget for history (4 chars ≈ 1 token, budget = 6k tokens). */
const MAX_HISTORY_CHARS = 24_000

/** localStorage key for persisted sessions. */
const STORAGE_KEY = 'ai_chat_sessions'

/** Max sessions to keep in storage. */
const MAX_STORED_SESSIONS = 5

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PersistedSession {
  id: string
  messages: ChatMessageItem[]
  createdAt: string
  updatedAt: string
}

// ── Context window management ─────────────────────────────────────────────────

/**
 * Trims history to fit within MAX_HISTORY_TURNS and MAX_HISTORY_CHARS.
 * Always keeps the most recent turns. Pairs are preserved (user+assistant).
 */
export function trimHistory(messages: ChatMessageItem[]): ConversationMessage[] {
  const done = messages.filter(
    m => m.status === 'done' && (m.role === 'user' || m.role === 'assistant'),
  )

  // Build pairs from the end: [user, assistant, user, assistant, ...]
  // The last message in `done` should be the assistant reply before current send.
  // We take up to MAX_HISTORY_TURNS * 2 messages from the tail.
  const maxMessages = MAX_HISTORY_TURNS * 2
  let slice = done.slice(-maxMessages)

  // Ensure we start on a user message (complete pairs only)
  if (slice.length > 0 && slice[0].role === 'assistant') {
    slice = slice.slice(1)
  }

  // Trim by character budget from the front
  let totalChars = slice.reduce((sum, m) => sum + m.content.length, 0)
  while (totalChars > MAX_HISTORY_CHARS && slice.length >= 2) {
    totalChars -= slice[0].content.length + slice[1].content.length
    slice = slice.slice(2)
  }

  return slice.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
}

/**
 * Returns a deduplication hint string for the system prompt injection.
 * Prevents the AI from re-introducing itself or repeating context already established.
 */
export function buildContextHint(messages: ChatMessageItem[]): string | null {
  const doneCount = messages.filter(m => m.status === 'done').length
  if (doneCount < 4) return null // no hint needed for short conversations

  const topics = extractTopics(messages)
  if (!topics.length) return null

  return `[Context: This is a continuing conversation. Topics already covered: ${topics.join(', ')}. Do not re-introduce yourself.]`
}

function extractTopics(messages: ChatMessageItem[]): string[] {
  const topics: string[] = []
  const userMessages = messages
    .filter(m => m.role === 'user' && m.status === 'done')
    .slice(-6)
    .map(m => m.content.toLowerCase())

  const patterns: [RegExp, string][] = [
    [/project|built|work/i, 'projects'],
    [/skill|tech|stack|language/i, 'skills'],
    [/service|offer|hire|freelance/i, 'services'],
    [/contact|email|reach|book|call/i, 'contact'],
    [/experience|career|job|role/i, 'experience'],
    [/availab|when|timeline/i, 'availability'],
    [/price|cost|rate|budget/i, 'pricing'],
    [/interview|question/i, 'interview questions'],
    [/architect|design|decision/i, 'architecture'],
    [/backend|api|spring/i, 'backend experience'],
    [/ai|llm|openai|gpt/i, 'AI experience'],
    [/cloud|aws|kubernetes/i, 'cloud projects'],
    [/metric|achiev|result|impact/i, 'achievements'],
    [/fit|suitable|recommend/i, 'role fit'],
  ]

  for (const [pattern, label] of patterns) {
    if (userMessages.some(m => pattern.test(m)) && !topics.includes(label)) {
      topics.push(label)
    }
  }

  return topics
}

// ── Session persistence ───────────────────────────────────────────────────────

export function saveSession(session: PersistedSession): void {
  try {
    const all = loadAllSessions()
    const idx = all.findIndex(s => s.id === session.id)
    if (idx >= 0) {
      all[idx] = session
    } else {
      all.unshift(session)
    }
    // Keep only the most recent N sessions
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, MAX_STORED_SESSIONS)))
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

export function loadSession(id: string): PersistedSession | null {
  return loadAllSessions().find(s => s.id === id) ?? null
}

export function loadAllSessions(): PersistedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PersistedSession[]
  } catch {
    return []
  }
}

export function deleteSession(id: string): void {
  try {
    const all = loadAllSessions().filter(s => s.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {}
}

// ── Export ────────────────────────────────────────────────────────────────────

export function exportConversation(messages: ChatMessageItem[], format: 'txt' | 'md' = 'md'): void {
  const done = messages.filter(m => m.status === 'done')
  if (!done.length) return

  const lines: string[] = []
  const date = new Date().toLocaleDateString('en-US', { dateStyle: 'long' })

  if (format === 'md') {
    lines.push(`# Conversation with Portfolio Assistant`)
    lines.push(`*Exported on ${date}*\n`)
    for (const m of done) {
      const label = m.role === 'user' ? '**You**' : '**Assistant**'
      const time = m.timestamp instanceof Date
        ? m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      lines.push(`### ${label} · ${time}\n`)
      lines.push(m.content)
      lines.push('')
    }
  } else {
    lines.push(`Conversation with Portfolio Assistant — ${date}\n`)
    lines.push('='.repeat(50) + '\n')
    for (const m of done) {
      const label = m.role === 'user' ? 'You' : 'Assistant'
      lines.push(`[${label}]`)
      lines.push(m.content)
      lines.push('')
    }
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chat-export-${Date.now()}.${format}`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Follow-up questions ───────────────────────────────────────────────────────

/**
 * Generates contextual follow-up suggestions based on the last assistant reply.
 * Recruiter-oriented: covers all documented query intents.
 * Pure client-side heuristic — no extra API call.
 */
export function generateFollowUps(messages: ChatMessageItem[]): string[] {
  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant' && m.status === 'done')
  if (!lastAssistant) return []

  const content = lastAssistant.content.toLowerCase()
  const asked = new Set(messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase()))

  // Ordered: first match wins. Recruiter intents first.
  const patterns: [RegExp, string[]][] = [
    [/interview|question to ask/,        ['What system design questions should I ask?', 'What are his strongest technical areas?']],
    [/architect|design decision/,        ['What were the key technical challenges?', 'Compare all projects in a table']],
    [/multi.?tenant|saas/,               ['How did he handle tenant data isolation?', 'What cloud infrastructure did he use?']],
    [/kafka|event.?stream/,              ['What throughput and latency did he achieve?', 'Did he use event sourcing?']],
    [/llm|openai|gpt|ai pipeline/,       ['What was the straight-through rate?', 'How did he reduce token costs?']],
    [/cloud|aws|kubernetes|ecs/,         ['What specific AWS services did he use?', 'How did he handle CI/CD?']],
    [/backend|api|spring boot/,          ['List his backend projects', 'What databases has he worked with?']],
    [/payroll|compliance/,               ['How many statutory rules did the engine handle?', 'What was the batch processing improvement?']],
    [/reconcil|fintech|payment/,         ['What accuracy did the reconciliation engine achieve?', 'How did he prevent duplicate charges?']],
    [/metric|achiev|result|impact/,      ['Summarise all key metrics in a table', 'Which project had the biggest impact?']],
    [/fit|suitable|recommend.*role/,     ['Generate interview questions for this candidate', 'What roles is he best suited for?']],
    [/experience|career|year/,           ['What is his current role?', 'List his backend experience']],
    [/project|built|developed/,          ['Compare all projects in a table', 'What were the technical challenges?']],
    [/skill|tech|stack/,                 ['List his AI experience', 'Show his cloud projects']],
    [/freelance|hire|service/,           ['How do I book a discovery call?', 'What is his typical project timeline?']],
    [/contact|email|reach/,              ['Can I book a call directly?']],
    [/availab/,                          ['What is his current availability?', 'How do I get started?']],
  ]

  const seen = new Set<string>()
  const suggestions: string[] = []

  for (const [pattern, questions] of patterns) {
    if (pattern.test(content)) {
      for (const q of questions) {
        if (!seen.has(q) && !asked.has(q.toLowerCase())) {
          seen.add(q)
          suggestions.push(q)
        }
      }
    }
    if (suggestions.length >= 3) break
  }

  return suggestions.slice(0, 3)
}
