// ─────────────────────────────────────────────────────────────────────────────
// src/content/seo/index.ts
// Default and per-page SEO metadata.
// ─────────────────────────────────────────────────────────────────────────────
import type { PageMeta } from '@/types'
import { NAME, TITLE, YEARS_EXP, SEO } from '@/content/settings/portfolio.config'

export const SEO_TITLE_DEFAULT = SEO.title
export const SEO_DESCRIPTION   = SEO.description
export const SEO_KEYWORDS      = SEO.keywords
export const SEO_OG_IMAGE      = SEO.ogImage

export const DEFAULT_META: PageMeta = {
  title:       SEO_TITLE_DEFAULT,
  description: SEO_DESCRIPTION,
  keywords:    SEO_KEYWORDS,
  ogImage:     SEO_OG_IMAGE,
}

export const PAGE_META: Record<string, PageMeta> = {
  home: {
    title:       SEO_TITLE_DEFAULT,
    description: `I build the full stack solutions that startups bet their product on. ${YEARS_EXP}+ years of enterprise engineering.`,
  },
  about: {
    title:       `About | ${NAME}`,
    description: `${TITLE} with a philosophy-first approach to building enterprise systems.`,
  },
  experience: {
    title:       `Experience | ${NAME}`,
    description: `${YEARS_EXP}+ years of enterprise software engineering across Java, Spring Boot, Angular, Vue.js, AWS, and cloud infrastructure.`,
  },
  projects: {
    title:       `Projects | ${NAME}`,
    description: 'Selected work — enterprise systems, cloud infrastructure, and AI-assisted development.',
  },
  skills: {
    title:       `Skills | ${NAME}`,
    description: 'Full technical picture — Java, Spring Boot, Angular, Vue.js, MySQL, PostgreSQL, Oracle, Docker, GCP, AWS, Jenkins.',
  },
  services: {
    title:       `Services | ${NAME}`,
    description: 'Full stack engineering, cloud architecture, AI integration and technical consulting for startups and enterprises.',
  },
  testimonials: {
    title:       `Testimonials | ${NAME}`,
    description: `What clients and colleagues say about working with ${NAME}.`,
  },
  blog: {
    title:       `Blog | ${NAME}`,
    description: 'Thoughts on enterprise engineering, cloud architecture, and AI-assisted development.',
  },
  contact: {
    title:       `Contact | ${NAME}`,
    description: `Let's build something serious. Available for new projects.`,
  },
}
