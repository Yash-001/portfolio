/**
 * app.constants.ts — re-exports from src/content layer under legacy names.
 * All existing component imports continue to work without changes.
 */
import {
  OWNER_NAME,
  OWNER_TITLE,
  OWNER_TAGLINE,
  OWNER_YEARS_EXP,
  OWNER_EMAIL,
  OWNER_LOCATION,
  OWNER_TIMEZONE,
  OWNER_AVAILABILITY,
  OWNER_AVAILABILITY_TEXT,
  OWNER_RESPONSE_TIME,
  SITE_URL,
  RESUME_URL,
  CALENDLY_URL,
  HERO_STATS,
} from '@/content/profile'

import {
  GITHUB_URL,
  LINKEDIN_URL,
  EMAIL_MAILTO,
} from '@/content/social'

export const APP_NAME                = OWNER_NAME
export const APP_TITLE               = OWNER_TITLE
export const APP_TAGLINE             = OWNER_TAGLINE
export const APP_URL                 = SITE_URL
export const APP_EMAIL               = OWNER_EMAIL
export const APP_LOCATION            = OWNER_LOCATION
export const APP_TIMEZONE            = OWNER_TIMEZONE
export const APP_YEARS_EXPERIENCE    = OWNER_YEARS_EXP
export const APP_AVAILABILITY_STATUS = OWNER_AVAILABILITY
export const APP_AVAILABILITY_TEXT   = OWNER_AVAILABILITY_TEXT
export const APP_RESPONSE_TIME       = OWNER_RESPONSE_TIME
export const APP_RESUME_URL          = RESUME_URL
export const APP_CALENDLY_URL        = CALENDLY_URL

export const SOCIAL_LINKS = {
  github:   GITHUB_URL,
  linkedin: LINKEDIN_URL,
  email:    EMAIL_MAILTO,
} as const

export const STATS = HERO_STATS
