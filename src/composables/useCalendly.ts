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

    // JS
    if (window.Calendly) { resolve(); return }

    const script    = document.createElement('script')
    script.src      = CALENDLY_JS
    script.async    = true
    script.onload   = () => resolve()
    script.onerror  = () => {
      scriptPromise = null
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
        url:      CALENDLY_URL,
        invitee:  e.data.payload?.invitee?.uri ?? '',
        event:    e.data.payload?.event?.uri   ?? '',
      })
    }
  })
}

// ── Composable ─────────────────────────────────────────────────────────────

const isLoading = ref(false)
const hasError  = ref(false)

export function useCalendly() {
  /** Visitor's IANA timezone (falls back to owner timezone) */
  const visitorTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || OWNER_TIMEZONE

  /** Build a Calendly URL with timezone pre-filled */
  function buildUrl(base = CALENDLY_URL): string {
    const url = new URL(base)
    url.searchParams.set('hide_gdpr_banner', '1')
    url.searchParams.set('timezone', visitorTimezone)
    return url.toString()
  }

  /** Open Calendly popup */
  async function openPopup(prefill?: CalendlyPrefill): Promise<void> {
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
      // Fallback: open in new tab
      window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')
    } finally {
      isLoading.value = false
    }
  }

  /** Mount inline widget into a container element */
  async function mountInline(container: HTMLElement, prefill?: CalendlyPrefill): Promise<void> {
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
    isLoading:       readonly(isLoading),
    hasError:        readonly(hasError),
    availability:    OWNER_AVAILABILITY,
    visitorTimezone,
    openPopup,
    mountInline,
    closePopup,
  }
}
