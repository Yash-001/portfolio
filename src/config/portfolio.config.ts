/**
 * portfolio.config.ts — Single source of truth for all portfolio content.
 *
 * To update the entire portfolio, edit ONLY this file.
 * Every component, page, and constant derives its values from here.
 */

// ── Identity ────────────────────────────────────────────────────────────────
export const OWNER_NAME            = 'Yash Ranjan'
export const OWNER_INITIALS        = 'YR'
export const OWNER_TITLE           = 'Enterprise Software & AI Consultant'
export const OWNER_TAGLINE         = 'I build production-ready full-stack applications enhanced with AI.'
export const OWNER_BIO_SHORT       = 'Building production-grade systems for startups and enterprises. Available for remote engagements worldwide.'
export const OWNER_YEARS_EXP       = 7

// ── Contact ─────────────────────────────────────────────────────────────────
export const OWNER_EMAIL           = import.meta.env.VITE_APP_EMAIL as string || 'yash.ranjan.dev@proton.me'
export const OWNER_PHONE           = import.meta.env.VITE_APP_PHONE as string || '+91-7779964211'   // optional
export const OWNER_LOCATION        = 'India (UTC+5:30)'
export const OWNER_TIMEZONE        = 'Asia/Kolkata'
export const OWNER_TIMEZONE_LABEL  = 'UTC+5:30'
export const OWNER_RESPONSE_TIME   = '24 hours'

// ── Availability ─────────────────────────────────────────────────────────────
export const OWNER_AVAILABILITY: 'available' | 'busy' | 'unavailable' = 'available'
export const OWNER_AVAILABILITY_TEXT = 'Available for new projects'

// ── URLs ─────────────────────────────────────────────────────────────────────
export const SITE_URL              = import.meta.env.VITE_APP_URL as string || 'https://yourdomain.com'
export const RESUME_URL            = '/resume.pdf'
export const CALENDLY_URL          = import.meta.env.VITE_CALENDLY_URL as string || 'https://calendly.com/placeholder'

// ── Social ───────────────────────────────────────────────────────────────────
export const GITHUB_URL            = 'https://github.com/Yash-001'
export const LINKEDIN_URL          = 'https://www.linkedin.com/in/yash-ranjan-a0197b166/'
export const EMAIL_MAILTO          = `mailto:${OWNER_EMAIL}`

// ── Profile image ─────────────────────────────────────────────────────────────
// Set to a path like '/images/profile.jpg' or an absolute URL.
// When undefined the hero card renders the icon placeholder.
export const PROFILE_IMAGE: string | undefined = undefined

// ── SEO ──────────────────────────────────────────────────────────────────────
export const SEO_TITLE_DEFAULT     = `${OWNER_NAME} | ${OWNER_TITLE}`
export const SEO_DESCRIPTION       = `${OWNER_TITLE} with ${OWNER_YEARS_EXP}+ years building enterprise backends, cloud infrastructure, and AI-assisted systems. Java, Spring Boot, Vue.js, Angular, AWS, GCP.`
export const SEO_KEYWORDS          = 'Senior Java Developer, Spring Boot, Angular, Vue.js, GCP, AWS, Enterprise Software, Freelance Developer, Full Stack Engineer, Python, AI/ML'
export const SEO_OG_IMAGE          = '/og-image.jpg'

// ── Stats (hero card counters) ────────────────────────────────────────────────
export const HERO_STATS = [
  { value: 7,  suffix: '+', label: 'Years Exp.'     },
  { value: 10, suffix: '+', label: 'Projects Built' },
  { value: 5,  suffix: '',  label: 'Enterprise Apps' },
  { value: 3,  suffix: '',  label: 'Cloud Deploys'  },
] as const
