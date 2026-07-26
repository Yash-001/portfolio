/**
 * useCalendly — Calendly integration composable.
 *
 * Handles:
 *  - Lazy script loading (once, cached)
 *  - Popup booking
 *  - Inline embed
 *  - Availability status from config
 *  - Visitor timezone detection
 *  - Analytics event emission
 *  - Graceful fallback when VITE_CALENDLY_URL is not configured
 */
import { ref, readonly } from 'vue'
import { CALENDLY_URL, OWNER_TIMEZONE, OWNER_AVAILABILITY } from '@/config/portfolio.config'
import { tracker, EVENTS } from '@/analytics'

// ── Types ──────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: CalendlyPopupOptions) => void
      initInlineWidget: (opts: CalendlyInlineOptions) => void
      closePopupWidget: () => void
    }
  }
}

interface CalendlyPopupOptions {
  url: string
  prefill?: CalendlyPrefill
  utm?: CalendlyUtm
}

interface CalendlyInlineOptions {
  url: string
  parentElement: HTMLElement
  prefill?: CalendlyPrefill
  utm?: CalendlyUtm
}

interface CalendlyPrefill {
  name?: string
  email?: string
  customAnswers?: Record<string, string>
}

interface CalendlyUtm {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

// ── URL validation ─────────────────────────────────────────────────────────

/** Returns true only when CALENDLY_URL is a real, non-placeholder URL */
function isConfigured(url: string): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    // Reject the default placeholder value
    if (parsed.pathname === '/placeholder' || parsed.pathname === '/yourname/30min') return false
    return parsed.hostname === 'calendly.com'
  } catch {
    return false
  }
}

export const calendlyConfigured = isConfigured(CALENDLY_URL)

// ── Script loader (singleton promise) ─────────────────────────────────────

const CALENDLY_CSS = 'https://assets.calendly.com/assets/external/widget.css'
const CALENDLY_JS  = 'https://assets.calendly.com/assets/external/widget.js'

let scriptPromise: Promise<void> | null = null

function loadCalendlyScript(): Promise<void> {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    // CSS
    if (!document.querySelector(`link[href="${CALENDLY_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel  = 'stylesheet'
      link.href = CALENDLY_CSS
      document.head.appendChild(link)
    }

    // JS — already loaded
    if (window.Calendly) { resolve(); return }

    const script    = document.createElement('script')
    script.src      = CALENDLY_JS
    script.async    = true
    script.onload   = () => resolve()
    script.onerror  = () => {
      scriptPromise = null   // allow retry on next call
      reject(new Error('Calendly script failed to load'))
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}

// ── Calendly event listener (analytics bridge) ────────────────────────────

let listenerAttached = false

function attachCalendlyListener(): void {
  if (listenerAttached) return
  listenerAttached = true

  window.addEventListener('message', (e: MessageEvent) => {
    if (!e.data?.event?.startsWith('calendly.')) return

    const name = e.data.event as string

    if (name === 'calendly.event_type_viewed') {
      tracker.track(EVENTS.CALENDLY_VIEWED, { url: CALENDLY_URL })
    }
    if (name === 'calendly.date_and_time_selected') {
      tracker.track(EVENTS.CALENDLY_DATE_SELECTED, { url: CALENDLY_URL })
    }
    if (name === 'calendly.event_scheduled') {
      tracker.track(EVENTS.CALENDLY_BOOKED, {
        url:     CALENDLY_URL,
        invitee: e.data.payload?.invitee?.uri ?? '',
        event:   e.data.payload?.event?.uri   ?? '',
      })
    }
  })
}

// ── Composable ─────────────────────────────────────────────────────────────

export function useCalendly() {
  // Per-instance state — not shared across popup + inline simultaneously
  const isLoading = ref(false)
  const hasError  = ref(false)

  /** Visitor's IANA timezone (falls back to owner timezone) */
  const visitorTimezone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || OWNER_TIMEZONE
    } catch {
      return OWNER_TIMEZONE
    }
  })()

  /** Build a Calendly URL with timezone pre-filled */
  function buildUrl(base = CALENDLY_URL): string {
    const url = new URL(base)
    url.searchParams.set('hide_gdpr_banner', '1')
    url.searchParams.set('timezone', visitorTimezone)
    return url.toString()
  }

  /** Open Calendly popup */
  async function openPopup(prefill?: CalendlyPrefill): Promise<void> {
    if (!calendlyConfigured) {
      // Fallback: open raw URL in new tab (works even with a real URL set later)
      if (CALENDLY_URL) window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
      return
    }

    isLoading.value = true
    hasError.value  = false

    try {
      await loadCalendlyScript()
      attachCalendlyListener()

      tracker.track(EVENTS.CALENDLY_POPUP_OPENED, { url: CALENDLY_URL })

      window.Calendly!.initPopupWidget({
        url:     buildUrl(),
        prefill,
        utm: { utmSource: 'portfolio', utmMedium: 'popup', utmCampaign: 'book_call' },
      })
    } catch {
      hasError.value = true
      // Fallback: open the built URL (with timezone param) in a new tab
      window.open(buildUrl(), '_blank', 'noopener,noreferrer')
    } finally {
      isLoading.value = false
    }
  }

  /** Mount inline widget into a container element */
  async function mountInline(container: HTMLElement, prefill?: CalendlyPrefill): Promise<void> {
    if (!calendlyConfigured) {
      hasError.value = true
      return
    }

    isLoading.value = true
    hasError.value  = false

    try {
      await loadCalendlyScript()
      attachCalendlyListener()

      tracker.track(EVENTS.CALENDLY_INLINE_VIEWED, { url: CALENDLY_URL })

      window.Calendly!.initInlineWidget({
        url:           buildUrl(),
        parentElement: container,
        prefill,
        utm: { utmSource: 'portfolio', utmMedium: 'inline', utmCampaign: 'book_call' },
      })

      // Calendly injects an iframe asynchronously — wait for it before hiding skeleton
      await waitForIframe(container)
    } catch {
      hasError.value = true
    } finally {
      isLoading.value = false
    }
  }

  function closePopup(): void {
    window.Calendly?.closePopupWidget()
  }

  return {
    isLoading:          readonly(isLoading),
    hasError:           readonly(hasError),
    availability:       OWNER_AVAILABILITY,
    visitorTimezone,
    isConfigured:       calendlyConfigured,
    openPopup,
    mountInline,
    closePopup,
  }
}

// ── Iframe readiness helper ────────────────────────────────────────────────

/**
 * Resolves when Calendly's injected iframe fires its load event,
 * or after a 10-second timeout (whichever comes first).
 */
function waitForIframe(container: HTMLElement, timeoutMs = 10_000): Promise<void> {
  return new Promise((resolve) => {
    const deadline = setTimeout(resolve, timeoutMs)

    const observer = new MutationObserver(() => {
      const iframe = container.querySelector('iframe')
      if (!iframe) return

      observer.disconnect()
      iframe.addEventListener('load', () => { clearTimeout(deadline); resolve() }, { once: true })
      // If iframe is already loaded (cached)
      if (iframe.contentDocument?.readyState === 'complete') {
        clearTimeout(deadline)
        resolve()
      }
    })

    observer.observe(container, { childList: true, subtree: true })
  })
}
