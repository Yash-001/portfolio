// src/types/content/blog.content.types.ts
import type { BlogPost } from '@/types/blog.types'

export interface BlogAuthor {
  name: string
  role: string
  avatar?: string
}

export interface BlogPostFull extends BlogPost {
  category: string
  author: BlogAuthor
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
