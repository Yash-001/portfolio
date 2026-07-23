import type { EventName, EventProps } from '../events'

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void
  }
}

export const plausibleProvider = {
  id: 'plausible' as const,
  _ready: false,

  init(domain: string): void {
    if (!domain || typeof window === 'undefined' || this._ready) return

    const script         = document.createElement('script')
    script.src           = 'https://plausible.io/js/script.js'
    script.defer         = true
    script.dataset.domain = domain
    // Queue events fired before the script loads
    script.dataset.api   = 'https://plausible.io/api/event'
    script.onerror       = () => console.warn('[Analytics] Plausible script failed to load')
    document.head.appendChild(script)

    this._ready = true
  },

  page(_path: string, _title: string): void {
    // Plausible auto-tracks SPA navigation via its own history listener
  },

  track(event: EventName | string, props?: EventProps): void {
    if (!this._ready) return
    // Plausible props must be string | number | boolean — filter out undefined
    const cleaned = props
      ? Object.fromEntries(
          Object.entries(props).filter(([, v]) => v !== undefined),
        ) as Record<string, string | number | boolean>
      : undefined
    window.plausible?.(event, cleaned ? { props: cleaned } : undefined)
  },
}
