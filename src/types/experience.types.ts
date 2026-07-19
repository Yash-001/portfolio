// experience.types.ts
export interface ExperienceTech {
  name: string
}

export interface ExperienceHighlight {
  text: string
}

export interface Experience {
  id: string
  role: string
  company: string
  companyUrl?: string
  location: string
  type: 'full-time' | 'contract' | 'freelance' | 'part-time'
  startDate: string
  endDate: string | 'present'
  current: boolean
  description: string
  highlights: ExperienceHighlight[]
  tech: ExperienceTech[]
  order: number
}
