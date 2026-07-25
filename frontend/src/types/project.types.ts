export type ProjectStatus = 'completed' | 'in-progress' | 'archived'
export type ProjectCategory = 'enterprise' | 'backend' | 'cloud' | 'fullstack' | 'frontend'

export interface ProjectTech {
  name: string
  icon?: string
  color?: string
}

export interface ProjectLink {
  label: string
  url: string
  type: 'github' | 'live' | 'case-study' | 'demo'
}

export interface ProjectMetric {
  label: string
  value: string
  description?: string
}

export interface Project {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  longDescription?: string
  category: ProjectCategory
  status: ProjectStatus
  featured: boolean
  year: number
  duration?: string
  role?: string
  tech: ProjectTech[]
  links: ProjectLink[]
  metrics?: ProjectMetric[]
  thumbnail?: string
  images?: string[]
  problem?: string
  approach?: string
  outcome?: string
  reflection?: string
  order: number
}
