import { tracker, EVENTS } from '@/analytics'

/**
 * Typed analytics helpers for use in Vue components.
 * Every method maps to a specific EVENTS constant — no magic strings at call sites.
 */
export function useAnalytics() {
  return {
    // ── Projects ──────────────────────────────────────────────────────────
    trackProjectView(slug: string, title: string): void {
      tracker.track(EVENTS.PROJECT_VIEW, { slug, title })
    },

    trackProjectLinkClick(slug: string, type: 'github' | 'live' | string): void {
      tracker.track(EVENTS.PROJECT_LINK_CLICK, { slug, type })
    },

    // ── Downloads ─────────────────────────────────────────────────────────
    trackResumeDownload(): void {
      tracker.track(EVENTS.RESUME_DOWNLOAD)
    },

    // ── Contact ───────────────────────────────────────────────────────────
    trackContactStart(): void {
      tracker.track(EVENTS.CONTACT_START)
    },

    trackContactSubmit(success: boolean): void {
      tracker.track(EVENTS.CONTACT_SUBMIT, { success })
    },

    // ── Outbound ──────────────────────────────────────────────────────────
    trackOutboundClick(url: string, label: string): void {
      tracker.track(EVENTS.OUTBOUND_CLICK, { url, label })
    },

    // ── Calendly ──────────────────────────────────────────────────────────
    trackCalendlyPopupOpened(url: string): void {
      tracker.track(EVENTS.CALENDLY_POPUP_OPENED, { url })
    },

    trackCalendlyBooked(url: string, invitee: string, event: string): void {
      tracker.track(EVENTS.CALENDLY_BOOKED, { url, invitee, event })
    },

    // ── Engagement ────────────────────────────────────────────────────────
    trackScrollDepth(depth: 25 | 50 | 75 | 90 | 100): void {
      tracker.track(EVENTS.SCROLL_DEPTH, { depth })
    },

    trackSectionView(section: string): void {
      tracker.track(EVENTS.SECTION_VIEW, { section })
    },
  }
}
