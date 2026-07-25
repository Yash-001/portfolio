// ─────────────────────────────────────────────────────────────────────────────
// src/content/profile/index.ts
// Single source of truth for personal identity and contact information.
// ─────────────────────────────────────────────────────────────────────────────

// ── Identity ─────────────────────────────────────────────────────────────────
export const OWNER_NAME           = 'Yash Ranjan'
export const OWNER_INITIALS       = 'YR'
export const OWNER_TITLE          = 'Enterprise Software & AI Consultant'
export const OWNER_TAGLINE        = 'I build production-ready full-stack applications enhanced with AI.'
export const OWNER_BIO_SHORT      = 'Building production-grade systems for startups and enterprises. Available for remote engagements worldwide.'
export const OWNER_YEARS_EXP      = 7

// ── Contact ──────────────────────────────────────────────────────────────────
export const OWNER_EMAIL          = import.meta.env.VITE_APP_EMAIL as string || 'yash.ranjan.dev@gmail.com'
export const OWNER_PHONE          = import.meta.env.VITE_APP_PHONE as string || '+91-7779964211'
export const OWNER_LOCATION       = 'India (UTC+5:30)'
export const OWNER_TIMEZONE       = 'Asia/Kolkata'
export const OWNER_TIMEZONE_LABEL = 'UTC+5:30'
export const OWNER_RESPONSE_TIME  = '24 hours'

// ── Availability ─────────────────────────────────────────────────────────────
export const OWNER_AVAILABILITY: 'available' | 'busy' | 'unavailable' = 'available'
export const OWNER_AVAILABILITY_TEXT = 'Available for new projects'

// ── URLs ─────────────────────────────────────────────────────────────────────
export const SITE_URL    = import.meta.env.VITE_APP_URL as string || 'https://yourdomain.com'
export const RESUME_URL  = '/resume.pdf'
export const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL as string || 'https://calendly.com/placeholder'

// ── Profile image ─────────────────────────────────────────────────────────────
// Replace with your own photo path e.g. '/images/profile.jpg' or an absolute URL.
// Set to undefined to show the icon placeholder.
export const PROFILE_IMAGE: string | undefined =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'

// ── Hero stats (counter cards) ────────────────────────────────────────────────
export const HERO_STATS = [
  { value: 7,  suffix: '+', label: 'Years Exp.'  },
  { value: 10, suffix: '+', label: 'Projects'    },
  { value: 5,  suffix: '',  label: 'Enterprise'  },
  { value: 3,  suffix: '',  label: 'Cloud Apps'  },
] as const
