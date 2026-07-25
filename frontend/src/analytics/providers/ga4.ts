import type { EventName, EventProps } from '../events'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag:      (...args: unknown[]) => void
  }
}

export const ga4Provider = {
  id: 'ga4' as const,
  _ready: false,

  init(measurementId: string): void {
    if (!measurementId || typeof window === 'undefined' || this._ready) return

    window.dataLayer = window.dataLayer ?? []
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args)
    }
    window.gtag('js', new Date())
    window.gtag('config', measurementId, {
      send_page_view:       false,  // we fire page_view manually via router
      anonymize_ip:         true,
      cookie_flags:         'SameSite=None;Secure',
    })

    const script    = document.createElement('script')
    script.src      = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    script.async    = true
    script.onerror  = () => console.warn('[Analytics] GA4 script failed to load')
    document.head.appendChild(script)

    this._ready = true
  },

  page(path: string, title: string): void {
    if (!this._ready) return
    window.gtag?.('event', 'page_view', {
      page_path:  path,
      page_title: title,
    })
  },

  track(event: EventName | string, props?: EventProps): void {
    if (!this._ready) return
    window.gtag?.('event', event, props ?? {})
  },
}
