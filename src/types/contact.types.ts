// ── Enums ──────────────────────────────────────────────────────────────────

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

// ── Form payload ───────────────────────────────────────────────────────────

export interface ContactFormPayload {
  name:        string
  email:       string
  projectType: ProjectType | ''
  budget:      BudgetRange | ''
  message:     string
  /** Honeypot — must be empty on real submissions */
  honeypot:    string
}

// ── Validation ─────────────────────────────────────────────────────────────

export type ContactFormField = 'name' | 'email' | 'projectType' | 'message'

export type ContactFormErrors = Partial<Record<ContactFormField, string>>

export interface ValidationResult {
  valid:  boolean
  errors: ContactFormErrors
}

// ── Service layer ──────────────────────────────────────────────────────────

export interface ContactServiceResult {
  ok:      boolean
  /** Human-readable message for the UI */
  message: string
  /** Underlying error, if any */
  cause?:  unknown
}

export interface ContactServiceConfig {
  serviceId:  string
  templateId: string
  publicKey:  string
}

// ── Rate-limit state (persisted to sessionStorage) ─────────────────────────

export interface RateLimitState {
  /** ISO timestamp of last successful send */
  lastSentAt:  string
  /** Number of sends in the current window */
  sendCount:   number
  /** ISO timestamp when the current window started */
  windowStart: string
}

// ── Select options (co-located for type safety) ────────────────────────────

export interface SelectOption<T extends string> {
  value: T
  label: string
}

export const PROJECT_TYPE_OPTIONS: SelectOption<ProjectType>[] = [
  { value: 'backend-development',  label: 'Backend Development'  },
  { value: 'cloud-devops',         label: 'Cloud / DevOps'       },
  { value: 'technical-consulting', label: 'Technical Consulting' },
  { value: 'full-stack',           label: 'Full-Stack Project'   },
  { value: 'other',                label: 'Other'                },
]

export const BUDGET_OPTIONS: SelectOption<BudgetRange>[] = [
  { value: 'under-5k',  label: 'Under $5k'     },
  { value: '5k-15k',    label: '$5k – $15k'    },
  { value: '15k-30k',   label: '$15k – $30k'   },
  { value: '30k-plus',  label: '$30k+'          },
  { value: 'discuss',   label: "Let's discuss"  },
]
