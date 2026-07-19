export type BlogStatus = 'published' | 'draft' | 'archived'

export interface BlogTag {
  name: string
  slug: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content?: string
  coverImage?: string
  tags: BlogTag[]
  status: BlogStatus
  featured: boolean
  readingTime: number
  publishedAt: string
  updatedAt?: string
  externalUrl?: string
}
