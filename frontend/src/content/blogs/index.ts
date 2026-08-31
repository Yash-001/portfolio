// src/content/blogs/index.ts
// To add a post: create posts/<slug>.ts, import it here, add to BLOG_POSTS.
// To remove a post: delete the file and remove the import + array entry.

import type { BlogAuthor, BlogPostFull, BlogCategory } from '@/types/content'
import { BLOG_CATEGORIES } from '@/types/content'
import { BLOG_AUTHOR } from './author'

export type { BlogAuthor, BlogPostFull, BlogCategory }
export { BLOG_CATEGORIES }
export { BLOG_AUTHOR }

export const BLOG_CATEGORY_CONFIG: Record<string, { color: string; bg: string }> = {
  'Architecture': { color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
  'Backend':      { color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  'Frontend':     { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  'DevOps':       { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  'AI & ML':      { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'   },
  'Career':       { color: '#ec4899', bg: 'rgba(236,72,153,0.1)'  },
  'Performance':  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
}

export const BLOG_CATEGORY_GRADIENT: Record<string, { from: string; to: string }> = {
  'Architecture': { from: '#6366f1', to: '#8b5cf6' },
  'Backend':      { from: '#10b981', to: '#06b6d4' },
  'Frontend':     { from: '#8b5cf6', to: '#ec4899' },
  'DevOps':       { from: '#f59e0b', to: '#ef4444' },
  'AI & ML':      { from: '#06b6d4', to: '#6366f1' },
  'Career':       { from: '#ec4899', to: '#8b5cf6' },
  'Performance':  { from: '#ef4444', to: '#f59e0b' },
}

// ── Post imports (add one line per new post) ──────────────────────────────────
import postRls     from './posts/postgresql-rls-multi-tenancy'
import postBatch   from './posts/spring-batch-idempotency'
import postLlmCost from './posts/llm-token-cost-optimisation'
import postKafka   from './posts/kafka-event-sourcing-logistics'
import postEcs     from './posts/terraform-aws-ecs-zero-downtime'
import postGsap    from './posts/vue3-gsap-animation-patterns'
import postRedis   from './posts/materialised-views-redis-caching'
import postCareer  from './posts/senior-engineer-lessons-7-years'

// ── Registry (order = display order, newest first) ────────────────────────────
export const BLOG_POSTS: BlogPostFull[] = [
  postRls,
  postBatch,
  postLlmCost,
  postKafka,
  postEcs,
  postGsap,
  postRedis,
  postCareer,
]

export const POSTS_PER_PAGE = 6
