import type { EventName, EventProps } from '../events'

declare global {
  interface Window {
    clarity?: (method: string, ...args: unknown[]) => void
  }
}

export const clarityProvider = {
  id: 'clarity' as const,
  _ready: false,

  init(projectId: string): void {
    if (!projectId || typeof window === 'undefined' || this._ready) return

    // Official Microsoft Clarity snippet
    type ClarityWindow = { [key: string]: ((...args: unknown[]) => void) & { q?: unknown[][] } }
    ;(function (c: ClarityWindow, l: Document, a: string, r: string, i: string) {
      c[a] =
        c[a] ||
        function (...args: unknown[]) {
          (c[a].q = c[a].q || []).push(args)
        }
      const t    = l.createElement(r) as HTMLScriptElement
      t.async    = true
      t.src      = 'https://www.clarity.ms/tag/' + i
      t.onerror  = () => console.warn('[Analytics] Clarity script failed to load')
      const y    = l.getElementsByTagName(r)[0]
      y.parentNode?.insertBefore(t, y)
    })(window as unknown as ClarityWindow, document, 'clarity', 'script', projectId)

    this._ready = true
  },

  page(_path: string, _title: string): void {
    // Clarity auto-tracks navigation
  },

  track(event: EventName | string, props?: EventProps): void {
    if (!this._ready) return
    // Map event props to Clarity custom tags for session segmentation
    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        if (value !== undefined) {
          window.clarity?.('set', key, String(value))
        }
      })
    }
    window.clarity?.('event', event)
  },
}
