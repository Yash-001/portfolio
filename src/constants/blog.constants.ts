import type { BlogPost } from '@/types'
import { OWNER_NAME, OWNER_TITLE, PROFILE_IMAGE } from '@/config/portfolio.config'

export interface BlogAuthor {
  name: string
  role: string
  avatar?: string
}

export interface BlogPostFull extends BlogPost {
  category: string
  author: BlogAuthor
}

export const BLOG_AUTHOR: BlogAuthor = {
  name:   OWNER_NAME,
  role:   OWNER_TITLE,
  avatar: PROFILE_IMAGE,
}

export const BLOG_CATEGORIES = [
  'Architecture',
  'Backend',
  'Frontend',
  'DevOps',
  'AI & ML',
  'Career',
  'Performance',
] as const

export type BlogCategory = typeof BLOG_CATEGORIES[number]

export const BLOG_CATEGORY_CONFIG: Record<string, { color: string; bg: string }> = {
  'Architecture': { color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
  'Backend':      { color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  'Frontend':     { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  'DevOps':       { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  'AI & ML':      { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'   },
  'Career':       { color: '#ec4899', bg: 'rgba(236,72,153,0.1)'  },
  'Performance':  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
}

// Gradient per category for cover image placeholder
export const BLOG_CATEGORY_GRADIENT: Record<string, { from: string; to: string }> = {
  'Architecture': { from: '#6366f1', to: '#8b5cf6' },
  'Backend':      { from: '#10b981', to: '#06b6d4' },
  'Frontend':     { from: '#8b5cf6', to: '#ec4899' },
  'DevOps':       { from: '#f59e0b', to: '#ef4444' },
  'AI & ML':      { from: '#06b6d4', to: '#6366f1' },
  'Career':       { from: '#ec4899', to: '#8b5cf6' },
  'Performance':  { from: '#ef4444', to: '#f59e0b' },
}

export const BLOG_POSTS: BlogPostFull[] = [
  {
    id:          'blog-1',
    slug:        'postgresql-rls-multi-tenancy',
    title:       'PostgreSQL Row-Level Security: The Right Way to Build Multi-Tenant SaaS',
    excerpt:     'Most multi-tenant architectures use application-level tenant filtering. That\'s a bug waiting to happen. Here\'s how to push isolation down to the database layer with PostgreSQL RLS — and why it\'s safer, simpler, and faster.',
    category:    'Architecture',
    author:      BLOG_AUTHOR,
    tags:        [{ name: 'PostgreSQL', slug: 'postgresql' }, { name: 'Multi-Tenancy', slug: 'multi-tenancy' }, { name: 'SaaS', slug: 'saas' }],
    status:      'published',
    featured:    true,
    readingTime: 12,
    publishedAt: '2024-03-15',
    coverImage:  undefined,
  },
  {
    id:          'blog-2',
    slug:        'spring-batch-idempotency',
    title:       'Making Spring Batch Jobs Idempotent: Lessons from a Production Incident',
    excerpt:     'Our depreciation batch created duplicate journal entries when it retried after a transient DB failure. Here\'s the exact pattern we used to make it idempotent — and why batch_run_id is the key.',
    category:    'Backend',
    author:      BLOG_AUTHOR,
    tags:        [{ name: 'Spring Batch', slug: 'spring-batch' }, { name: 'Java', slug: 'java' }, { name: 'Idempotency', slug: 'idempotency' }],
    status:      'published',
    featured:    false,
    readingTime: 8,
    publishedAt: '2024-02-28',
    coverImage:  undefined,
  },
  {
    id:          'blog-3',
    slug:        'llm-token-cost-optimisation',
    title:       'Cutting GPT-4o Token Costs by 60% Without Losing Accuracy',
    excerpt:     'Token cost is the main engineering constraint in LLM integrations. Here\'s the chunking strategy, prompt compression techniques, and confidence scoring approach that reduced our per-document cost by 60% in production.',
    category:    'AI & ML',
    author:      BLOG_AUTHOR,
    tags:        [{ name: 'OpenAI', slug: 'openai' }, { name: 'LLM', slug: 'llm' }, { name: 'Cost Optimisation', slug: 'cost-optimisation' }],
    status:      'published',
    featured:    false,
    readingTime: 10,
    publishedAt: '2024-02-10',
    coverImage:  undefined,
  },
  {
    id:          'blog-4',
    slug:        'kafka-event-sourcing-logistics',
    title:       'From 90-Second Staleness to 3 Seconds: Kafka Event Streaming in Practice',
    excerpt:     'We replaced a polling-based GPS tracking system with Kafka event streaming. Location staleness dropped from 90 seconds to under 3 seconds. Here\'s the architecture, the tradeoffs, and what we got wrong the first time.',
    category:    'Backend',
    author:      BLOG_AUTHOR,
    tags:        [{ name: 'Kafka', slug: 'kafka' }, { name: 'Event Sourcing', slug: 'event-sourcing' }, { name: 'Spring Boot', slug: 'spring-boot' }],
    status:      'published',
    featured:    false,
    readingTime: 14,
    publishedAt: '2024-01-22',
    coverImage:  undefined,
  },
  {
    id:          'blog-5',
    slug:        'terraform-aws-ecs-zero-downtime',
    title:       'Zero-Downtime AWS ECS Deployments with Terraform and Blue/Green',
    excerpt:     'A step-by-step guide to blue/green deployments on AWS ECS using Terraform. Covers ALB listener rules, task definition versioning, health check configuration, and automated rollback on smoke test failure.',
    category:    'DevOps',
    author:      BLOG_AUTHOR,
    tags:        [{ name: 'AWS', slug: 'aws' }, { name: 'Terraform', slug: 'terraform' }, { name: 'ECS', slug: 'ecs' }],
    status:      'published',
    featured:    false,
    readingTime: 11,
    publishedAt: '2024-01-08',
    coverImage:  undefined,
  },
  {
    id:          'blog-6',
    slug:        'vue3-gsap-animation-patterns',
    title:       'Production Animation Patterns in Vue 3 with GSAP',
    excerpt:     'The animation patterns I use across every Vue 3 project: gsap.context() for cleanup, ScrollTrigger with once:true, 3D tilt on mousemove, and conic-gradient borders that follow the cursor. All production-tested.',
    category:    'Frontend',
    author:      BLOG_AUTHOR,
    tags:        [{ name: 'Vue 3', slug: 'vue3' }, { name: 'GSAP', slug: 'gsap' }, { name: 'Animation', slug: 'animation' }],
    status:      'published',
    featured:    false,
    readingTime: 9,
    publishedAt: '2023-12-18',
    coverImage:  undefined,
  },
  {
    id:          'blog-7',
    slug:        'materialised-views-redis-caching',
    title:       'Dashboard in 8ms: Materialised Views + Redis Cache-Aside Pattern',
    excerpt:     'Our dashboard aggregation query took 2.8 seconds on the largest tenant. Here\'s the exact combination of PostgreSQL materialised views, Redis caching, and scheduled refresh that got it to 8ms with a 97% cache hit rate.',
    category:    'Performance',
    author:      BLOG_AUTHOR,
    tags:        [{ name: 'PostgreSQL', slug: 'postgresql' }, { name: 'Redis', slug: 'redis' }, { name: 'Performance', slug: 'performance' }],
    status:      'published',
    featured:    false,
    readingTime: 7,
    publishedAt: '2023-11-30',
    coverImage:  undefined,
  },
  {
    id:          'blog-8',
    slug:        'senior-engineer-lessons-7-years',
    title:       'Seven Years as a Software Engineer: What I Got Wrong and What I\'d Do Differently',
    excerpt:     'The technical decisions I regret, the architectural patterns I wish I\'d learned earlier, and the non-technical skills that turned out to matter more than I expected. An honest retrospective.',
    category:    'Career',
    author:      BLOG_AUTHOR,
    tags:        [{ name: 'Career', slug: 'career' }, { name: 'Engineering', slug: 'engineering' }, { name: 'Lessons', slug: 'lessons' }],
    status:      'published',
    featured:    false,
    readingTime: 6,
    publishedAt: '2023-11-12',
    coverImage:  undefined,
  },
]

export const POSTS_PER_PAGE = 6
