// ─────────────────────────────────────────────────────────────────────────────
// src/services/ai/knowledge/knowledge.builder.ts
// Builds a normalized PortfolioKnowledge model from the content layer.
//
// Rules:
//   - Imports ONLY from src/content/* — never duplicates data
//   - Adding a project/skill/service to content auto-updates AI knowledge
//   - No hardcoded strings — all values flow from content
// ─────────────────────────────────────────────────────────────────────────────

import {
  OWNER_NAME, OWNER_TITLE, OWNER_TAGLINE, OWNER_BIO_SHORT, OWNER_YEARS_EXP,
  OWNER_EMAIL, OWNER_PHONE, OWNER_LOCATION, OWNER_TIMEZONE, OWNER_TIMEZONE_LABEL,
  OWNER_RESPONSE_TIME, OWNER_AVAILABILITY, OWNER_AVAILABILITY_TEXT,
  SITE_URL, RESUME_URL, CALENDLY_URL,
} from '@/content/profile'
import { GITHUB_URL, LINKEDIN_URL } from '@/content/social'
import { PROJECTS } from '@/content/projects'
import { EXPERIENCES } from '@/content/experience'
import { SKILL_GROUPS } from '@/content/skills'
import { SERVICES } from '@/content/settings'
import { FAQ_ITEMS } from '@/content/faq'
import { BLOG_POSTS } from '@/content/blogs'

import type {
  PortfolioKnowledge,
  KnowledgeSummary,
  KnowledgeCareerEntry,
  KnowledgeProject,
  KnowledgeSkillCategory,
  KnowledgeService,
  KnowledgeFaq,
  KnowledgeBlogPost,
  KnowledgeTechnology,
} from './knowledge.types'

// ── Section builders ──────────────────────────────────────────────────────────

function buildSummary(): KnowledgeSummary {
  return {
    name: OWNER_NAME,
    title: OWNER_TITLE,
    tagline: OWNER_TAGLINE,
    bio: OWNER_BIO_SHORT,
    yearsOfExperience: OWNER_YEARS_EXP,
    contact: {
      email: OWNER_EMAIL,
      phone: OWNER_PHONE,
      location: OWNER_LOCATION,
      timezone: OWNER_TIMEZONE,
      timezoneLabel: OWNER_TIMEZONE_LABEL,
      responseTime: OWNER_RESPONSE_TIME,
      availability: OWNER_AVAILABILITY,
      availabilityText: OWNER_AVAILABILITY_TEXT,
      siteUrl: SITE_URL,
      resumeUrl: RESUME_URL,
      calendlyUrl: CALENDLY_URL,
      github: GITHUB_URL,
      linkedin: LINKEDIN_URL,
    },
  }
}

function buildCareer(): KnowledgeCareerEntry[] {
  return [...EXPERIENCES]
    .sort((a, b) => a.order - b.order)
    .map(e => ({
      id: e.id,
      role: e.role,
      company: e.company,
      location: e.location,
      type: e.typeConfig.label,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      description: e.description,
      highlights: e.highlights.map(h => h.text),
      technologies: e.tech.map(t => t.name),
    }))
}

function buildProjects(): KnowledgeProject[] {
  return [...PROJECTS]
    .sort((a, b) => a.order - b.order)
    .map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      tagline: p.tagline,
      description: p.description,
      category: p.categoryConfig.label,
      status: p.status,
      featured: p.featured,
      year: p.year,
      duration: p.duration,
      role: p.role,
      problem: p.problem,
      approach: p.approach,
      outcome: p.outcome,
      technologies: p.tech.map(t => t.name),
      metrics: (p.metrics ?? []).map(m => ({
        label: m.label,
        value: m.value,
        description: m.description,
      })),
    }))
}

function buildSkillCategories(): KnowledgeSkillCategory[] {
  return SKILL_GROUPS.map(g => ({
    category: g.category,
    label: g.label,
    description: g.description,
    skills: g.skills.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      level: s.level,
      yearsOfExperience: s.yearsOfExperience,
      context: s.context,
    })),
  }))
}

function buildServices(): KnowledgeService[] {
  return [...SERVICES]
    .sort((a, b) => a.order - b.order)
    .map(s => ({
      id: s.id,
      title: s.title,
      tagline: s.tagline,
      description: s.description,
      deliverables: s.deliverables.map(d => d.text),
      engagement: s.engagement,
      duration: s.duration,
      featured: s.featured,
    }))
}

function buildFaq(): KnowledgeFaq[] {
  return [...FAQ_ITEMS]
    .sort((a, b) => a.order - b.order)
    .map(f => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
    }))
}

function buildRecentPosts(): KnowledgeBlogPost[] {
  return [...BLOG_POSTS]
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      tags: p.tags.map(t => t.name),
      readingTime: p.readingTime,
      publishedAt: p.publishedAt,
    }))
}

/**
 * Derives a deduplicated technology index from projects + experience.
 * Each entry aggregates which categories it appears in and total project count.
 */
function buildTechnologies(): KnowledgeTechnology[] {
  // Collect tech from projects
  const techMap = new Map<string, { categories: Set<string>; projectCount: number }>()

  for (const project of PROJECTS) {
    for (const t of project.tech) {
      const entry = techMap.get(t.name) ?? { categories: new Set(), projectCount: 0 }
      entry.categories.add(project.categoryConfig.label)
      entry.projectCount += 1
      techMap.set(t.name, entry)
    }
  }

  // Cross-reference years of experience from skills
  const skillYearsMap = new Map<string, number>()
  for (const group of SKILL_GROUPS) {
    for (const skill of group.skills) {
      skillYearsMap.set(skill.name.toLowerCase(), skill.yearsOfExperience)
    }
  }

  return Array.from(techMap.entries())
    .map(([name, data]) => ({
      name,
      categories: Array.from(data.categories),
      projectCount: data.projectCount,
      yearsOfExperience: skillYearsMap.get(name.toLowerCase()) ?? 0,
    }))
    .sort((a, b) => b.projectCount - a.projectCount || b.yearsOfExperience - a.yearsOfExperience)
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Builds the complete normalized knowledge model from the content layer.
 * Call this once and cache the result — it is pure and synchronous.
 *
 * Adding a new project to PROJECTS, a new skill to SKILL_GROUPS, or a new
 * service to SERVICES automatically reflects here with no other changes.
 */
export function buildKnowledge(): PortfolioKnowledge {
  return {
    summary: buildSummary(),
    career: buildCareer(),
    projects: buildProjects(),
    skillCategories: buildSkillCategories(),
    services: buildServices(),
    faq: buildFaq(),
    recentPosts: buildRecentPosts(),
    technologies: buildTechnologies(),
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Lazily-evaluated singleton. The knowledge object is built once on first
 * access and reused for the lifetime of the module.
 */
let _cached: PortfolioKnowledge | null = null

export function getKnowledge(): PortfolioKnowledge {
  if (!_cached) _cached = buildKnowledge()
  return _cached
}

/** Call this if content is hot-reloaded in development. */
export function invalidateKnowledge(): void {
  _cached = null
}
