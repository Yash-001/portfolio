// ─────────────────────────────────────────────────────────────────────────────
// src/services/ai/knowledge/knowledge.types.ts
// Normalized knowledge model consumed by the AI service.
// All fields map 1-to-1 from the content layer — no invented data.
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowledgeContact {
  email: string
  phone: string
  location: string
  timezone: string
  timezoneLabel: string
  responseTime: string
  availability: string
  availabilityText: string
  siteUrl: string
  resumeUrl: string
  calendlyUrl: string
  github: string
  linkedin: string
}

export interface KnowledgeSummary {
  name: string
  title: string
  tagline: string
  bio: string
  yearsOfExperience: number
  contact: KnowledgeContact
}

export interface KnowledgeCareerEntry {
  id: string
  role: string
  company: string
  location: string
  type: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  highlights: string[]
  technologies: string[]
}

export interface KnowledgeProjectMetric {
  label: string
  value: string
  description?: string
}

export interface KnowledgeProject {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  category: string
  status: string
  featured: boolean
  year: number
  duration?: string
  role?: string
  problem?: string
  approach?: string
  outcome?: string
  technologies: string[]
  metrics: KnowledgeProjectMetric[]
}

export interface KnowledgeSkill {
  id: string
  name: string
  category: string
  level: string
  yearsOfExperience: number
  context?: string
}

export interface KnowledgeSkillCategory {
  category: string
  label: string
  description: string
  skills: KnowledgeSkill[]
}

export interface KnowledgeService {
  id: string
  title: string
  tagline: string
  description: string
  deliverables: string[]
  engagement: string
  duration?: string
  featured: boolean
}

export interface KnowledgeFaq {
  id: string
  question: string
  answer: string
  category: string
}

export interface KnowledgeBlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  readingTime: number
  publishedAt: string
}

export interface KnowledgeTechnology {
  name: string
  categories: string[]
  projectCount: number
  yearsOfExperience: number
}

export interface PortfolioKnowledge {
  summary: KnowledgeSummary
  career: KnowledgeCareerEntry[]
  projects: KnowledgeProject[]
  skillCategories: KnowledgeSkillCategory[]
  services: KnowledgeService[]
  faq: KnowledgeFaq[]
  recentPosts: KnowledgeBlogPost[]
  technologies: KnowledgeTechnology[]
  generatedAt: string
}
