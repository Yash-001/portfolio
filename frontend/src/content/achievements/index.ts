// ─────────────────────────────────────────────────────────────────────────────
// src/content/achievements/index.ts
// Notable achievements, awards, and recognitions.
// ─────────────────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string
  title: string
  description: string
  year: number
  icon?: string
  url?: string
}

export const ACHIEVEMENTS: Achievement[] = [
  // Example — replace with real data:
  // {
  //   id: 'open-source-contrib',
  //   title: 'Open Source Contributor',
  //   description: 'Contributed performance fix to Spring Boot accepted in v3.2',
  //   year: 2023,
  //   icon: 'pi pi-github',
  // },
]
