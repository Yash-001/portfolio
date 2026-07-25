// ─────────────────────────────────────────────────────────────────────────────
// src/content/settings/portfolio.config.ts
// Single source of truth for all reusable portfolio configuration.
// Edit this file to update name, contact, social, SEO, theme, and analytics.
// ─────────────────────────────────────────────────────────────────────────────

const env = import.meta.env

// ── Identity ─────────────────────────────────────────────────────────────────
export const NAME         = 'Yash Ranjan'
export const INITIALS     = 'YR'
export const TITLE        = 'Enterprise Software & AI Consultant'
export const TAGLINE      = 'I build production-ready full-stack applications enhanced with AI.'
export const BIO_SHORT    = 'Building production-grade systems for startups and enterprises. Available for remote engagements worldwide.'
export const YEARS_EXP    = 7

// ── Contact ──────────────────────────────────────────────────────────────────
export const EMAIL        = (env.VITE_APP_EMAIL    as string) || 'yash.ranjan.dev@gmail.com'
export const PHONE        = (env.VITE_APP_PHONE    as string) || '+91-7779964211'
export const LOCATION     = 'India (UTC+5:30)'
export const TIMEZONE     = 'Asia/Kolkata'
export const TIMEZONE_LABEL = 'UTC+5:30'
export const RESPONSE_TIME  = '24 hours'

// ── Social ────────────────────────────────────────────────────────────────────
export const GITHUB   = 'https://github.com/Yash-001'
export const LINKEDIN = 'https://www.linkedin.com/in/yash-ranjan-a0197b166/'

// ── Availability ─────────────────────────────────────────────────────────────
export const AVAILABILITY: 'available' | 'busy' | 'unavailable' = 'available'
export const AVAILABILITY_TEXT = 'Available for new projects'

// ── URLs ─────────────────────────────────────────────────────────────────────
export const SITE_URL    = (env.VITE_APP_URL      as string) || 'https://yourdomain.com'
export const RESUME_URL  = '/resume.pdf'
export const CALENDLY_URL = (env.VITE_CALENDLY_URL as string) || 'https://calendly.com/placeholder'

// ── Profile image ─────────────────────────────────────────────────────────────
// Drop your photo at: public/media/profile/avatar.jpg
// Falls back to Unsplash placeholder until a local file is present.
export const PROFILE_IMAGE: string =
  (env.VITE_PROFILE_IMAGE as string) ||
  '/media/profile/avatar.jpg'

// ── Default SEO ───────────────────────────────────────────────────────────────
export const SEO = {
  title:       `${NAME} | ${TITLE}`,
  description: `${TITLE} with ${YEARS_EXP}+ years building enterprise backends, cloud infrastructure, and AI-assisted systems. Java, Spring Boot, Vue.js, Angular, AWS, GCP.`,
  keywords:    'Senior Java Developer, Spring Boot, Angular, Vue.js, GCP, AWS, Enterprise Software, Freelance Developer, Full Stack Engineer, Python, AI/ML',
  ogImage:     '/og-image.jpg',
} as const

// ── Theme ─────────────────────────────────────────────────────────────────────
export const DEFAULT_THEME = 'dark' as const

// ── Analytics ─────────────────────────────────────────────────────────────────
export const ANALYTICS = {
  gaMeasurementId:   (env.VITE_GA_MEASUREMENT_ID   as string) || '',
  plausibleDomain:   (env.VITE_PLAUSIBLE_DOMAIN     as string) || '',
  clarityProjectId:  (env.VITE_CLARITY_PROJECT_ID   as string) || '',
  enabledInDev:      env.VITE_ANALYTICS_DEV === 'true',
} as const
