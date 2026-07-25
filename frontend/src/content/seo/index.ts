// ─────────────────────────────────────────────────────────────────────────────
// src/content/seo/index.ts
// Single source of truth for all page metadata.
// Every page's title, description, keywords, OG, Twitter, and canonical live here.
// ─────────────────────────────────────────────────────────────────────────────
import type { PageMeta } from '@/types'
import { NAME, TITLE, YEARS_EXP, SITE_URL, SEO } from '@/content/settings/portfolio.config'

// ── Shared defaults ───────────────────────────────────────────────────────────
export const SEO_TITLE_DEFAULT = SEO.title
export const SEO_DESCRIPTION   = SEO.description
export const SEO_KEYWORDS      = SEO.keywords
export const SEO_OG_IMAGE      = SEO.ogImage

export const DEFAULT_META: PageMeta = {
  title:       SEO_TITLE_DEFAULT,
  description: SEO_DESCRIPTION,
  keywords:    SEO_KEYWORDS,
  ogImage:     SEO_OG_IMAGE,
  ogType:      'website',
  twitterCard: 'summary_large_image',
  canonical:   SITE_URL,
}

// ── Per-page metadata ─────────────────────────────────────────────────────────
export const PAGE_META: Record<string, PageMeta> = {
  home: {
    title:       SEO_TITLE_DEFAULT,
    description: `I build production-ready full-stack applications enhanced with AI. ${YEARS_EXP}+ years of enterprise engineering across Java, Spring Boot, Vue.js, and AWS.`,
    keywords:    'Enterprise Software Engineer, Java Developer, Spring Boot, Vue.js, AWS, Full Stack, AI Integration, Freelance Developer',
    ogImage:     SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary_large_image',
    canonical:   `${SITE_URL}/`,
  },
  about: {
    title:       `About | ${NAME}`,
    description: `${TITLE} with a philosophy-first approach to building enterprise systems. ${YEARS_EXP}+ years turning complex requirements into clean, maintainable code.`,
    keywords:    `About ${NAME}, Enterprise Software Consultant, Java Engineer, Full Stack Developer`,
    ogImage:     SEO_OG_IMAGE,
    ogType:      'profile',
    twitterCard: 'summary_large_image',
    canonical:   `${SITE_URL}/about`,
  },
  experience: {
    title:       `Experience | ${NAME}`,
    description: `${YEARS_EXP}+ years of enterprise software engineering across Java, Spring Boot, Angular, Vue.js, AWS, and cloud infrastructure. From fintech startups to multi-tenant SaaS platforms.`,
    keywords:    'Software Engineering Experience, Java, Spring Boot, Angular, Vue.js, AWS, GCP, Enterprise, Fintech',
    ogImage:     SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary_large_image',
    canonical:   `${SITE_URL}/experience`,
  },
  projects: {
    title:       `Projects | ${NAME}`,
    description: 'Selected work — enterprise systems, cloud infrastructure, and AI-assisted development. Multi-tenant SaaS, LLM pipelines, real-time logistics, payroll engines.',
    keywords:    'Portfolio Projects, Multi-Tenant SaaS, LLM Pipeline, Kafka, Spring Boot, Java, Enterprise Projects',
    ogImage:     SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary_large_image',
    canonical:   `${SITE_URL}/projects`,
  },
  skills: {
    title:       `Skills | ${NAME}`,
    description: 'Full technical picture — Java, Spring Boot, Angular, Vue.js, PostgreSQL, Oracle, Docker, Kubernetes, GCP, AWS, Jenkins, Python, AI/ML.',
    keywords:    'Technical Skills, Java, Spring Boot, Angular, Vue.js, PostgreSQL, Docker, Kubernetes, AWS, GCP, Python, AI ML',
    ogImage:     SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary_large_image',
    canonical:   `${SITE_URL}/skills`,
  },
  services: {
    title:       `Services | ${NAME}`,
    description: 'Full stack engineering, cloud architecture, AI integration, and technical consulting for startups and enterprises. Available for remote engagements worldwide.',
    keywords:    'Software Consulting Services, Full Stack Engineering, Cloud Architecture, AI Integration, Technical Consulting, Freelance',
    ogImage:     SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary_large_image',
    canonical:   `${SITE_URL}/services`,
  },
  testimonials: {
    title:       `Testimonials | ${NAME}`,
    description: `What clients and colleagues say about working with ${NAME} — enterprise engineering, delivery quality, and technical leadership.`,
    keywords:    `${NAME} Reviews, Client Testimonials, Software Engineer Recommendations`,
    ogImage:     SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary_large_image',
    canonical:   `${SITE_URL}/testimonials`,
  },
  blog: {
    title:       `Blog | ${NAME}`,
    description: 'Thoughts on enterprise engineering, cloud architecture, AI-assisted development, and lessons from 7+ years in production systems.',
    keywords:    'Engineering Blog, Java, Spring Boot, PostgreSQL, Kafka, LLM, AWS, Architecture, Performance',
    ogImage:     SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary_large_image',
    canonical:   `${SITE_URL}/blog`,
  },
  contact: {
    title:       `Contact | ${NAME}`,
    description: `Let's build something serious. Available for new projects — remote engagements worldwide. Typical response within 24 hours.`,
    keywords:    `Hire ${NAME}, Contact Software Engineer, Freelance Java Developer, Remote Consulting`,
    ogImage:     SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary_large_image',
    canonical:   `${SITE_URL}/contact`,
  },
  privacy: {
    title:       `Privacy Policy | ${NAME}`,
    description: 'Privacy policy for yashranjan.dev.',
    ogImage:     SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary',
    canonical:   `${SITE_URL}/privacy`,
    noIndex:     true,
  },
  terms: {
    title:       `Terms of Use | ${NAME}`,
    description: 'Terms of use for yashranjan.dev.',
    ogImage:     SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary',
    canonical:   `${SITE_URL}/terms`,
    noIndex:     true,
  },
  'not-found': {
    title:       `404 — Page Not Found | ${NAME}`,
    description: 'The page you are looking for does not exist.',
    ogImage:     SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary',
    canonical:   `${SITE_URL}/`,
    noIndex:     true,
  },
}

// ── Dynamic generators ────────────────────────────────────────────────────────
// Used by BlogPostPage and ProjectDetailPage to generate metadata from content.

export function blogPostMeta(post: {
  title: string
  excerpt: string
  slug: string
  category: string
  coverImage?: string
  tags: { name: string }[]
} | null): PageMeta {
  if (!post) {
    return {
      title:       `Article Not Found | ${NAME}`,
      description: 'This article does not exist or has been removed.',
      ogImage:     SEO_OG_IMAGE,
      ogType:      'article',
      twitterCard: 'summary',
      canonical:   `${SITE_URL}/blog`,
      noIndex:     true,
    }
  }
  return {
    title:       `${post.title} | ${NAME}`,
    description: post.excerpt,
    keywords:    post.tags.map(t => t.name).join(', '),
    ogImage:     post.coverImage ?? SEO_OG_IMAGE,
    ogType:      'article',
    twitterCard: 'summary_large_image',
    twitterImage: post.coverImage ?? SEO_OG_IMAGE,
    canonical:   `${SITE_URL}/blog/${post.slug}`,
  }
}

export function projectDetailMeta(project: {
  title: string
  description: string
  slug: string
  tech: { name: string }[]
  thumbnail?: string
} | null): PageMeta {
  if (!project) {
    return {
      title:       `Project Not Found | ${NAME}`,
      description: 'This project does not exist or has been removed.',
      ogImage:     SEO_OG_IMAGE,
      ogType:      'website',
      twitterCard: 'summary',
      canonical:   `${SITE_URL}/projects`,
      noIndex:     true,
    }
  }
  return {
    title:       `${project.title} | ${NAME}`,
    description: project.description,
    keywords:    project.tech.map(t => t.name).join(', '),
    ogImage:     project.thumbnail ?? SEO_OG_IMAGE,
    ogType:      'website',
    twitterCard: 'summary_large_image',
    twitterImage: project.thumbnail ?? SEO_OG_IMAGE,
    canonical:   `${SITE_URL}/projects/${project.slug}`,
  }
}
