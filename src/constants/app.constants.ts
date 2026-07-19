export const APP_NAME = 'Yash Ranjan'
export const APP_TITLE = 'Senior Software Engineer'
export const APP_TAGLINE = 'I build the backend that startups bet their product on.'
export const APP_URL = import.meta.env.VITE_APP_URL || 'https://yourdomain.com'
export const APP_EMAIL = 'your@email.com'
export const APP_LOCATION = 'India (UTC+5:30)'
export const APP_TIMEZONE = 'UTC+5:30'
export const APP_YEARS_EXPERIENCE = 7
export const APP_AVAILABILITY_STATUS: 'available' | 'busy' | 'unavailable' = 'available'
export const APP_AVAILABILITY_TEXT = 'Available for new projects'
export const APP_RESPONSE_TIME = '24 hours'

export const SOCIAL_LINKS = {
  github:   'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
  email:    `mailto:${APP_EMAIL}`,
} as const

export const STATS = [
  { value: 7,  suffix: '+', label: 'Years Exp.' },
  { value: 10, suffix: '+', label: 'Projects Built' },
  { value: 5,  suffix: '',  label: 'Enterprise Apps' },
  { value: 3,  suffix: '',  label: 'Cloud Deploys' },
] as const
