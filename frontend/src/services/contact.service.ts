/**
 * contact.service.ts
 *
 * Enterprise contact automation:
 *  1. Spam scoring  — multi-signal heuristic (honeypot, link density, keywords, timing)
 *  2. Rate limiting — 3 sends / 10 min, persisted to sessionStorage
 *  3. Deduplication — 60-second identical-payload window
 *  4. Admin email   — full details + attachment via VITE_EMAILJS_TEMPLATE_ID
 *  5. Auto-reply    — confirmation to visitor via VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID
 *  6. Retry         — 3 attempts with exponential back-off (1.5s → 3s → 6s)
 *  7. Attachment    — base64 data URL forwarded to EmailJS template
 *  8. Never throws  — always returns typed ContactServiceResult
 */

import type {
  ContactFormPayload,
  ContactServiceResult,
  ContactServiceConfig,
  RateLimitState,
  SpamScore,
} from '@/types/contact.types'
import {
  OWNER_NAME,
  OWNER_EMAIL,
  OWNER_RESPONSE_TIME,
  SITE_URL,
} from '@/config/portfolio.config'

// ── Constants ──────────────────────────────────────────────────────────────

const RATE_LIMIT_KEY       = 'contact_rl'
const DEDUP_KEY            = 'contact_dd'
const MAX_SENDS            = 3
const WINDOW_MS            = 10 * 60 * 1000   // 10 min
const DEDUP_MS             = 60 * 1000         // 60 s
const MAX_RETRIES          = 3
const BASE_RETRY_DELAY_MS  = 1500

// ── Config ─────────────────────────────────────────────────────────────────

function getConfig(): ContactServiceConfig | null {
  const serviceId       = import.meta.env.VITE_EMAILJS_SERVICE_ID        as string | undefined
  const adminTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID       as string | undefined
  const replyTemplateId = import.meta.env.VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID as string | undefined
  const publicKey       = import.meta.env.VITE_EMAILJS_PUBLIC_KEY        as string | undefined

  if (!serviceId || !adminTemplateId || !publicKey) return null

  return {
    serviceId,
    adminTemplateId,
    replyTemplateId: replyTemplateId ?? null,
    publicKey,
  }
}

// ── Spam scoring ───────────────────────────────────────────────────────────

const SPAM_KEYWORDS = [
  'casino', 'crypto', 'bitcoin', 'nft', 'seo service', 'backlink',
  'click here', 'free money', 'make money fast', 'loan offer',
  'viagra', 'cialis', 'pharmacy', 'weight loss', 'diet pill',
]

const URL_RE = /https?:\/\/\S+/gi

function scoreSpam(payload: ContactFormPayload, fillTimeMs: number): SpamScore {
  let score   = 0
  const reasons: string[] = []

  // Honeypot filled
  if (payload.honeypot?.trim()) {
    score += 100
    reasons.push('honeypot')
  }

  // Filled too fast (< 4 seconds — bots don't read)
  if (fillTimeMs < 4000) {
    score += 40
    reasons.push('filled_too_fast')
  }

  const text = `${payload.name} ${payload.message}`.toLowerCase()

  // Spam keywords
  const hits = SPAM_KEYWORDS.filter((kw) => text.includes(kw))
  if (hits.length) {
    score += hits.length * 15
    reasons.push(`keywords:${hits.join(',')}`)
  }

  // Excessive URLs in message
  const urls = payload.message.match(URL_RE) ?? []
  if (urls.length > 2) {
    score += (urls.length - 2) * 10
    reasons.push(`url_count:${urls.length}`)
  }

  // All-caps name
  if (payload.name === payload.name.toUpperCase() && payload.name.length > 3) {
    score += 10
    reasons.push('all_caps_name')
  }

  // Suspiciously short message for a "project inquiry"
  if (payload.message.trim().length < 30) {
    score += 15
    reasons.push('message_too_short')
  }

  return { score: Math.min(score, 100), reasons }
}

// ── Rate limiting ──────────────────────────────────────────────────────────

function readRl(): RateLimitState | null {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY)
    return raw ? (JSON.parse(raw) as RateLimitState) : null
  } catch { return null }
}

function writeRl(s: RateLimitState): void {
  try { sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

function checkRateLimit(): ContactServiceResult | null {
  const now   = Date.now()
  const state = readRl()
  if (!state) return null

  const windowStart = new Date(state.windowStart).getTime()
  if (now - windowStart < WINDOW_MS && state.sendCount >= MAX_SENDS) {
    const resetIn = Math.ceil((windowStart + WINDOW_MS - now) / 60_000)
    return {
      ok:      false,
      message: `Too many messages. Please wait ${resetIn} minute${resetIn !== 1 ? 's' : ''} before trying again.`,
      cause:   'RATE_LIMITED',
    }
  }
  return null
}

function recordSend(): void {
  const now   = Date.now()
  const state = readRl()
  if (!state) {
    writeRl({ lastSentAt: new Date(now).toISOString(), sendCount: 1, windowStart: new Date(now).toISOString() })
    return
  }
  const windowStart = new Date(state.windowStart).getTime()
  const inWindow    = now - windowStart < WINDOW_MS
  writeRl({
    lastSentAt:  new Date(now).toISOString(),
    sendCount:   inWindow ? state.sendCount + 1 : 1,
    windowStart: inWindow ? state.windowStart : new Date(now).toISOString(),
  })
}

// ── Deduplication ──────────────────────────────────────────────────────────

function hashPayload(p: ContactFormPayload): string {
  const str = `${p.name}|${p.email}|${p.projectType}|${p.message}`
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return String(h)
}

function checkDedup(hash: string): ContactServiceResult | null {
  try {
    const raw = sessionStorage.getItem(DEDUP_KEY)
    if (!raw) return null
    const { h, ts } = JSON.parse(raw) as { h: string; ts: number }
    if (h === hash && Date.now() - ts < DEDUP_MS) {
      return {
        ok:      false,
        message: 'This message was already sent. Please wait a moment before sending again.',
        cause:   'DUPLICATE',
      }
    }
  } catch { /* ignore */ }
  return null
}

function recordDedup(hash: string): void {
  try { sessionStorage.setItem(DEDUP_KEY, JSON.stringify({ h: hash, ts: Date.now() })) } catch { /* ignore */ }
}

// ── Retry helper ───────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Exponential back-off: 1.5s, 3s, 6s */
function retryDelay(attempt: number): number {
  return BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1)
}

// ── EmailJS transport ──────────────────────────────────────────────────────

type EmailJSParams = Record<string, string | undefined>

async function sendEmail(
  config: ContactServiceConfig,
  templateId: string,
  params: EmailJSParams,
): Promise<string> {
  const emailjs = await import('@emailjs/browser')
  const res = await emailjs.send(config.serviceId, templateId, params, {
    publicKey: config.publicKey,
    limitRate: { throttle: 2000 },
  })
  return res.text ?? 'OK'
}

// ── Template param builders ────────────────────────────────────────────────

function buildAdminParams(payload: ContactFormPayload): EmailJSParams {
  const now = new Date()
  return {
    from_name:        payload.name.trim(),
    from_email:       payload.email.trim().toLowerCase(),
    reply_to:         payload.email.trim().toLowerCase(),
    project_type:     payload.projectType || 'Not specified',
    budget:           payload.budget      || 'Not specified',
    message:          payload.message.trim(),
    // Attachment
    attachment_name:  payload.attachment?.name,
    attachment_data:  payload.attachment?.dataUrl,
    // Meta
    submitted_at:     now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    site_url:         SITE_URL,
    owner_name:       OWNER_NAME,
  }
}

function buildReplyParams(payload: ContactFormPayload): EmailJSParams {
  return {
    to_name:          payload.name.trim(),
    to_email:         payload.email.trim().toLowerCase(),
    reply_to:         OWNER_EMAIL,
    owner_name:       OWNER_NAME,
    response_time:    OWNER_RESPONSE_TIME,
    project_type:     payload.projectType || 'Not specified',
    site_url:         SITE_URL,
    calendly_url:     import.meta.env.VITE_CALENDLY_URL as string | undefined,
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/** Tracks when the form was first rendered for timing-based spam detection */
export const formLoadedAt = Date.now()

export async function submitContactForm(
  payload: ContactFormPayload,
): Promise<ContactServiceResult> {
  const fillTimeMs = Date.now() - formLoadedAt

  // 1. Spam scoring
  const spam = scoreSpam(payload, fillTimeMs)
  if (spam.score >= 60) {
    // Silently succeed to not reveal detection to bots
    if (import.meta.env.DEV) {
      console.warn('[ContactService] Spam detected', spam)
    }
    return { ok: true, message: 'Message sent successfully.' }
  }

  // 2. Rate limit
  const rlError = checkRateLimit()
  if (rlError) return rlError

  // 3. Deduplication
  const hash    = hashPayload(payload)
  const ddError = checkDedup(hash)
  if (ddError) return ddError

  // 4. Config check
  const config = getConfig()
  if (!config) {
    console.warn(
      '[ContactService] EmailJS not configured.\n' +
      'Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY in .env',
    )
    return {
      ok:      false,
      message: 'Contact form is not configured. Please email me directly.',
      cause:   'EMAILJS_NOT_CONFIGURED',
    }
  }

  // 5. Send admin notification with retry + exponential back-off
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const emailId = await sendEmail(config, config.adminTemplateId, buildAdminParams(payload))

      // 6. Fire-and-forget auto-reply (non-blocking, non-retried)
      if (config.replyTemplateId) {
        sendEmail(config, config.replyTemplateId, buildReplyParams(payload)).catch((err) => {
          console.warn('[ContactService] Auto-reply failed (non-critical):', err)
        })
      }

      recordSend()
      recordDedup(hash)

      return {
        ok:      true,
        message: 'Message sent successfully.',
        emailId,
        attempt,
      }
    } catch (err: unknown) {
      lastError = err

      if (attempt < MAX_RETRIES) {
        await sleep(retryDelay(attempt))
        continue
      }
    }
  }

  // All retries exhausted
  const isNetwork = lastError instanceof Error && (
    lastError.message.includes('Network') ||
    lastError.message.includes('fetch')   ||
    lastError.message.includes('Failed to fetch')
  )

  return {
    ok:      false,
    message: isNetwork
      ? 'Network error. Please check your connection and try again.'
      : 'Failed to send message. Please try again or email me directly.',
    cause: isNetwork ? 'NETWORK_ERROR' : 'UNKNOWN',
  }
}
