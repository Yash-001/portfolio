// ─────────────────────────────────────────────────────────────────────────────
// src/content/profile/index.ts
// Re-exports identity and contact data from portfolio.config.ts.
// ─────────────────────────────────────────────────────────────────────────────
import {
  NAME, INITIALS, TITLE, TAGLINE, BIO_SHORT, YEARS_EXP,
  EMAIL, PHONE, LOCATION, TIMEZONE, TIMEZONE_LABEL, RESPONSE_TIME,
  AVAILABILITY, AVAILABILITY_TEXT,
  SITE_URL, RESUME_URL, CALENDLY_URL,
  PROFILE_IMAGE,
} from '@/content/settings/portfolio.config'

export const OWNER_NAME           = NAME
export const OWNER_INITIALS       = INITIALS
export const OWNER_TITLE          = TITLE
export const OWNER_TAGLINE        = TAGLINE
export const OWNER_BIO_SHORT      = BIO_SHORT
export const OWNER_YEARS_EXP      = YEARS_EXP

export const OWNER_EMAIL          = EMAIL
export const OWNER_PHONE          = PHONE
export const OWNER_LOCATION       = LOCATION
export const OWNER_TIMEZONE       = TIMEZONE
export const OWNER_TIMEZONE_LABEL = TIMEZONE_LABEL
export const OWNER_RESPONSE_TIME  = RESPONSE_TIME

export const OWNER_AVAILABILITY       = AVAILABILITY
export const OWNER_AVAILABILITY_TEXT  = AVAILABILITY_TEXT

export { SITE_URL, RESUME_URL, CALENDLY_URL, PROFILE_IMAGE }

export const HERO_STATS = [
  { value: 7,  suffix: '+', label: 'Years Exp.'  },
  { value: 5, suffix: '+', label: 'Projects'    },
  { value: 4,  suffix: '',  label: 'Enterprise'  },
  { value: 3,  suffix: '',  label: 'Cloud Apps'  },
] as const
