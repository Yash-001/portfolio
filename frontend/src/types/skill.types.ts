export type SkillLevel = 'expert' | 'advanced' | 'intermediate' | 'learning'

export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'cloud'
  | 'ai'
  | 'database'
  | 'devops'
  | 'testing'
  | 'architecture'
  | 'soft-skills'

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  level: SkillLevel
  yearsOfExperience: number
  context?: string
  icon?: string
  featured: boolean
}

export interface SkillGradient {
  from: string
  to: string
  glow: string
}

export interface SkillGroup {
  category: SkillCategory
  label: string
  description: string
  icon: string
  gradient: SkillGradient
  skills: Skill[]
}
