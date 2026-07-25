import type { EventName, EventProps } from './events'
import { ga4Provider }       from './providers/ga4'
import { plausibleProvider } from './providers/plausible'
import { clarityProvider }   from './providers/clarity'

interface AnalyticsProvider {
  id:     string
  init:   (key: string) => void
  page:   (path: string, title: string) => void
  track:  (event: EventName | string, props?: EventProps) => void
}

const active: AnalyticsProvider[] = []

export const tracker = {
  /**
   * Initialise all configured providers.
   * Must be called once — in the analytics Vue plugin.
   * No-ops in development unless VITE_ANALYTICS_DEV=true.
   */
  init(): void {
    const isDev    = import.meta.env.DEV
    const forceOn  = import.meta.env.VITE_ANALYTICS_DEV === 'true'
    if (isDev && !forceOn) return

    const ga4Id      = import.meta.env.VITE_GA_MEASUREMENT_ID  as string | undefined
    const plausible  = import.meta.env.VITE_PLAUSIBLE_DOMAIN   as string | undefined
    const clarityId  = import.meta.env.VITE_CLARITY_PROJECT_ID as string | undefined

    if (ga4Id) {
      ga4Provider.init(ga4Id)
      active.push(ga4Provider)
    }

    if (plausible) {
      plausibleProvider.init(plausible)
      active.push(plausibleProvider)
    }

    if (clarityId) {
      clarityProvider.init(clarityId)
      active.push(clarityProvider)
    }
  },

  page(path: string, title: string): void {
    active.forEach((p) => {
      try { p.page(path, title) } catch { /* provider errors must never crash the app */ }
    })
  },

  track(event: EventName | string, props?: EventProps): void {
    active.forEach((p) => {
      try { p.track(event, props) } catch { /* provider errors must never crash the app */ }
    })
  },

  /** Returns IDs of all currently active providers — useful for debugging. */
  activeProviders(): string[] {
    return active.map((p) => p.id)
  },
}
