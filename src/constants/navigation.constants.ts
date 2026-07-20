import type { NavLink, SocialLink } from '@/types'
import { GITHUB_URL, LINKEDIN_URL, OWNER_EMAIL } from '@/config/portfolio.config'

export const NAV_LINKS: NavLink[] = [
  { label: 'Work',      to: '/#projects' },
  { label: 'Expertise', to: '/#skills'   },
  { label: 'Process',   to: '/services'  },
  { label: 'Contact',   to: '/contact'   },
]

export const FOOTER_LINKS: NavLink[] = [
  { label: 'About',        to: '/about'        },
  { label: 'Experience',   to: '/experience'   },
  { label: 'Projects',     to: '/projects'     },
  { label: 'Skills',       to: '/skills'       },
  { label: 'Services',     to: '/services'     },
  { label: 'Testimonials', to: '/testimonials' },
  { label: 'Blog',         to: '/blog'         },
  { label: 'Contact',      to: '/contact'      },
]

export const SOCIAL_LINKS_NAV: SocialLink[] = [
  { platform: 'github',   url: GITHUB_URL,              label: 'GitHub',   icon: 'pi pi-github'   },
  { platform: 'linkedin', url: LINKEDIN_URL,            label: 'LinkedIn', icon: 'pi pi-linkedin' },
  { platform: 'email',    url: `mailto:${OWNER_EMAIL}`, label: 'Email',    icon: 'pi pi-envelope' },
]
