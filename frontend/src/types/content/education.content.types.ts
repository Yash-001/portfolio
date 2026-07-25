// src/types/content/education.content.types.ts

export interface Education {
  id: string
  degree: string
  field: string
  institution: string
  location: string
  startYear: number
  endYear: number | 'present'
  grade?: string
  highlights?: string[]
}
