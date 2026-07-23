export const EVENTS = {
  // Navigation
  PAGE_VIEW:           'page_view',

  // Engagement
  SCROLL_DEPTH:        'scroll_depth',
  SECTION_VIEW:        'section_view',

  // Projects
  PROJECT_VIEW:        'project_view',
  PROJECT_LINK_CLICK:  'project_link_click',

  // Downloads
  RESUME_DOWNLOAD:     'resume_download',

  // Contact
  CONTACT_START:       'contact_start',
  CONTACT_SUBMIT:      'contact_submit',

  // Outbound
  OUTBOUND_CLICK:      'outbound_click',
} as const

export type EventName = typeof EVENTS[keyof typeof EVENTS]

export interface EventProps {
  [key: string]: string | number | boolean | undefined
}

// ── Typed payload shapes per event ────────────────────────────────────────

export interface PageViewProps {
  page_path:  string
  page_title: string
}

export interface ScrollDepthProps extends EventProps {
  depth: 25 | 50 | 75 | 90 | 100
}

export interface SectionViewProps extends EventProps {
  section: string
}

export interface ProjectViewProps extends EventProps {
  slug:  string
  title: string
}

export interface ProjectLinkClickProps extends EventProps {
  slug: string
  type: 'github' | 'live'
}

export interface OutboundClickProps extends EventProps {
  url:   string
  label: string
}

export interface ContactSubmitProps extends EventProps {
  success: boolean
}
