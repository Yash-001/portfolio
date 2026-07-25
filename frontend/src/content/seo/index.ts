// ─────────────────────────────────────────────────────────────────────────────
// src/content/seo/index.ts
// Default and per-page SEO metadata.
// ─────────────────────────────────────────────────────────────────────────────
import type { PageMeta } from '@/types'
import { OWNER_NAME, OWNER_TITLE, OWNER_YEARS_EXP } from '@/content/profile'

export const SEO_TITLE_DEFAULT = `${OWNER_NAME} | ${OWNER_TITLE}`
export const SEO_DESCRIPTION   = `${OWNER_TITLE} with ${OWNER_YEARS_EXP}+ years building enterprise backends, cloud infrastructure, and AI-assisted systems. Java, Spring Boot, Vue.js, Angular, AWS, GCP.`
export const SEO_KEYWORDS      = 'Senior Java Developer, Spring Boot, Angular, Vue.js, GCP, AWS, Enterprise Software, Freelance Developer, Full Stack Engineer, Python, AI/ML'
export const SEO_OG_IMAGE      = '/og-image.jpg'

export const DEFAULT_META: PageMeta = {
  title:       SEO_TITLE_DEFAULT,
  description: SEO_DESCRIPTION,
  keywords:    SEO_KEYWORDS,
  ogImage:     SEO_OG_IMAGE,
}

export const PAGE_META: Record<string, PageMeta> = {
  home: {
    title:       SEO_TITLE_DEFAULT,
    description: `I build the full stack solutions that startups bet their product on. ${OWNER_YEARS_EXP}+ years of enterprise engineering.`,
  },
  about: {
    title:       `About | ${OWNER_NAME}`,
    description: `${OWNER_TITLE} with a philosophy-first approach to building enterprise systems.`,
  },
  experience: {
    title:       `Experience | ${OWNER_NAME}`,
    description: `${OWNER_YEARS_EXP}+ years of enterprise software engineering across Java, Spring Boot, Angular, Vue.js, AWS, and cloud infrastructure.`,
  },
  projects: {
    title:       `Projects | ${OWNER_NAME}`,
    description: 'Selected work — enterprise systems, cloud infrastructure, and AI-assisted development.',
  },
  skills: {
    title:       `Skills | ${OWNER_NAME}`,
    description: 'Full technical picture — Java, Spring Boot, Angular, Vue.js, MySQL, PostgreSQL, Oracle, Docker, GCP, AWS, Jenkins.',
  },
  services: {
    title:       `Services | ${OWNER_NAME}`,
    description: 'Full stack engineering, cloud architecture, AI integration and technical consulting for startups and enterprises.',
  },
  testimonials: {
    title:       `Testimonials | ${OWNER_NAME}`,
    description: `What clients and colleagues say about working with ${OWNER_NAME}.`,
  },
  blog: {
    title:       `Blog | ${OWNER_NAME}`,
    description: 'Thoughts on enterprise engineering, cloud architecture, and AI-assisted development.',
  },
  contact: {
    title:       `Contact | ${OWNER_NAME}`,
    description: `Let's build something serious. Available for new projects.`,
  },
}
