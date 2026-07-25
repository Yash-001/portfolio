// ─────────────────────────────────────────────────────────────────────────────
// src/content/education/index.ts
// Academic qualifications. Add entries as needed.
// ─────────────────────────────────────────────────────────────────────────────

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

export const EDUCATION: Education[] = [
  // Example — replace with real data:
  // {
  //   id: 'btech-cs',
  //   degree: 'B.Tech',
  //   field: 'Computer Science & Engineering',
  //   institution: 'University Name',
  //   location: 'City, India',
  //   startYear: 2013,
  //   endYear: 2017,
  //   grade: '8.2 CGPA',
  // },
]
