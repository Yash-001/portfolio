export type ProjectType =
  | 'backend-development'
  | 'cloud-devops'
  | 'technical-consulting'
  | 'full-stack'
  | 'other'

export type BudgetRange =
  | 'under-5k'
  | '5k-15k'
  | '15k-30k'
  | '30k-plus'
  | 'discuss'

export type ContactStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ContactForm {
  name: string
  email: string
  projectType: ProjectType | ''
  budget: BudgetRange | ''
  message: string
  honeypot?: string
}

export interface ContactFormErrors {
  name?: string
  email?: string
  projectType?: string
  message?: string
}
