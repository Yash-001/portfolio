export type SkillLevel = 'expert' | 'advanced' | 'intermediate' | 'learning'
export type SkillCategory =
  | 'backend'
  | 'database'
  | 'cloud'
  | 'frontend'
  | 'devops'
  | 'tools'
  | 'ai'

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

export interface SkillGroup {
  category: SkillCategory
  label: string
  description: string
  icon: string
  skills: Skill[]
}
