/**
 * portfolio.config.ts — re-exports from src/content layer.
 * All portfolio data lives in src/content/settings/portfolio.config.ts.
 * This file exists only for backward compatibility with any direct imports.
 */

// New unified config — import directly for new code
export * from '@/content/settings/portfolio.config'

// Legacy named exports — existing components continue to work unchanged
export {
  OWNER_NAME,
  OWNER_INITIALS,
  OWNER_TITLE,
  OWNER_TAGLINE,
  OWNER_BIO_SHORT,
  OWNER_YEARS_EXP,
  OWNER_EMAIL,
  OWNER_PHONE,
  OWNER_LOCATION,
  OWNER_TIMEZONE,
  OWNER_TIMEZONE_LABEL,
  OWNER_RESPONSE_TIME,
  OWNER_AVAILABILITY,
  OWNER_AVAILABILITY_TEXT,
  SITE_URL,
  RESUME_URL,
  CALENDLY_URL,
  PROFILE_IMAGE,
  HERO_STATS,
} from '@/content/profile'

export {
  GITHUB_URL,
  LINKEDIN_URL,
  EMAIL_MAILTO,
} from '@/content/social'

export {
  SEO_TITLE_DEFAULT,
  SEO_DESCRIPTION,
  SEO_KEYWORDS,
  SEO_OG_IMAGE,
} from '@/content/seo'
