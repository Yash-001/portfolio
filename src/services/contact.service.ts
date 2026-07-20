/**
 * ContactService
 *
 * Responsibilities:
 *  - Send contact form submissions via EmailJS
 *  - Enforce client-side rate limiting (max 3 sends / 10 min)
 *  - Deduplicate identical submissions within a 60-second window
 *  - Retry transient failures once with exponential back-off
 *  - Never throw — always return a typed ContactServiceResult
 */

import type {
  ContactFormPayload,
  ContactServiceResult,
  ContactServiceConfig,
  RateLimitState,
} from '@/types/contact.types'

// ── Constants ──────────────────────────────────────────────────────────────

const RATE_LIMIT_KEY      = 'contact_rate_limit'
const DEDUP_KEY           = 'contact_last_hash'
const MAX_SENDS_PER_WINDOW = 3
const WINDOW_MS            = 10 * 60 * 1000   // 10 minutes
const DEDUP_WINDOW_MS      = 60 * 1000         // 60 seconds
const RETRY_DELAY_MS       = 1500

// ── Helpers ────────────────────────────────────────────────────────────────

function getConfig(): ContactServiceConfig | null {
  const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID  as string | undefined
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string | undefined

  if (!serviceId || !templateId || !publicKey) return null
  return { serviceId, templateId, publicKey }
}

/** Stable hash of the payload for deduplication */
function hashPayload(payload: ContactFormPayload): string {
  const str = `${payload.name}|${payload.email}|${payload.projectType}|${payload.message}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return String(hash)
}

function getRateLimitState(): RateLimitState | null {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY)
    return raw ? (JSON.parse(raw) as RateLimitState) : null
  } catch {
    return null
  }
}

function setRateLimitState(state: RateLimitState): void {
  try {
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state))
  } catch { /* storage unavailable — degrade gracefully */ }
}

function checkRateLimit(): ContactServiceResult | null {
  const now   = Date.now()
  const state = getRateLimitState()

  if (!state) return null

  const windowStart = new Date(state.windowStart).getTime()
  const inWindow    = now - windowStart < WINDOW_MS

  if (inWindow && state.sendCount >= MAX_SENDS_PER_WINDOW) {
    const resetIn = Math.ceil((windowStart + WINDOW_MS - now) / 60_000)
    return {
      ok:      false,
      message: `Too many messages sent. Please wait ${resetIn} minute${resetIn !== 1 ? 's' : ''} before trying again.`,
    }
  }

  return null
}

function recordSend(): void {
  const now   = Date.now()
  const state = getRateLimitState()

  if (!state) {
    setRateLimitState({ lastSentAt: new Date(now).toISOString(), sendCount: 1, windowStart: new Date(now).toISOString() })
    return
  }

  const windowStart = new Date(state.windowStart).getTime()
  const inWindow    = now - windowStart < WINDOW_MS

  setRateLimitState({
    lastSentAt:  new Date(now).toISOString(),
    sendCount:   inWindow ? state.sendCount + 1 : 1,
    windowStart: inWindow ? state.windowStart : new Date(now).toISOString(),
  })
}

function checkDedup(hash: string): ContactServiceResult | null {
  try {
    const raw = sessionStorage.getItem(DEDUP_KEY)
    if (!raw) return null
    const { hash: lastHash, ts } = JSON.parse(raw) as { hash: string; ts: number }
    if (lastHash === hash && Date.now() - ts < DEDUP_WINDOW_MS) {
      return { ok: false, message: 'This message was already sent. Please wait a moment before sending again.' }
    }
  } catch { /* ignore */ }
  return null
}

function recordDedup(hash: string): void {
  try {
    sessionStorage.setItem(DEDUP_KEY, JSON.stringify({ hash, ts: Date.now() }))
  } catch { /* ignore */ }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ── EmailJS transport ──────────────────────────────────────────────────────

async function sendViaEmailJS(
  config: ContactServiceConfig,
  payload: ContactFormPayload,
): Promise<void> {
  // Dynamic import — keeps EmailJS out of the initial bundle
  const emailjs = await import('@emailjs/browser')

  const templateParams = {
    from_name:    payload.name.trim(),
    from_email:   payload.email.trim().toLowerCase(),
    project_type: payload.projectType,
    budget:       payload.budget || 'Not specified',
    message:      payload.message.trim(),
    reply_to:     payload.email.trim().toLowerCase(),
  }

  await emailjs.send(config.serviceId, config.templateId, templateParams, {
    publicKey: config.publicKey,
    limitRate: { throttle: 2000 },
  })
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function submitContactForm(
  payload: ContactFormPayload,
): Promise<ContactServiceResult> {
  // 1. Honeypot check
  if (payload.honeypot?.trim()) {
    // Silently succeed to not reveal the trap to bots
    return { ok: true, message: 'Message sent successfully.' }
  }

  // 2. Rate limit
  const rateLimitError = checkRateLimit()
  if (rateLimitError) return rateLimitError

  // 3. Deduplication
  const hash     = hashPayload(payload)
  const dedupError = checkDedup(hash)
  if (dedupError) return dedupError

  // 4. Config check
  const config = getConfig()
  if (!config) {
    // EmailJS not configured — log for developer, show generic error to user
    console.warn(
      '[ContactService] EmailJS environment variables are not set.\n' +
      'Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY in your .env file.',
    )
    return {
      ok:      false,
      message: 'Contact form is not configured. Please email me directly.',
      cause:   'EMAILJS_NOT_CONFIGURED',
    }
  }

  // 5. Send with one retry on transient failure
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await sendViaEmailJS(config, payload)
      recordSend()
      recordDedup(hash)
      return { ok: true, message: 'Message sent successfully.' }
    } catch (err: unknown) {
      if (attempt === 1) {
        await sleep(RETRY_DELAY_MS)
        continue
      }

      const isNetworkError = err instanceof Error && (
        err.message.includes('Network') ||
        err.message.includes('fetch') ||
        err.message.includes('Failed to fetch')
      )

      return {
        ok:      false,
        message: isNetworkError
          ? 'Network error. Please check your connection and try again.'
          : 'Failed to send message. Please try again or email me directly.',
        cause: err,
      }
    }
  }

  // Unreachable — TypeScript requires a return
  return { ok: false, message: 'Unexpected error. Please try again.' }
}
