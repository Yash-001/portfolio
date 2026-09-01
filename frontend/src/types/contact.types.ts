// ── Enums ──────────────────────────────────────────────────────────────────

export type ProjectType =
  | 'backend-development'
  | 'cloud-devops'
  | 'technical-consulting'
  | 'full-stack'
  | 'other'

export type BudgetRange =
  | 'under-10k'
  | '10k-25k'
  | '25k-50k'
  | '50k-1L'
  | '1L-plus'
  | 'discuss'

export type ContactStatus = 'idle' | 'loading' | 'success' | 'error'

// ── Attachment ─────────────────────────────────────────────────────────────

export interface AttachmentMeta {
  name:     string
  size:     number   // bytes
  type:     string   // MIME
  dataUrl:  string   // base64 data URL for EmailJS
}

export const ATTACHMENT_MAX_SIZE_MB = 5
export const ATTACHMENT_MAX_SIZE    = ATTACHMENT_MAX_SIZE_MB * 1024 * 1024
export const ATTACHMENT_ACCEPT      = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
].join(',')

export const ATTACHMENT_ACCEPT_LABELS = 'PDF, DOC, DOCX, PNG, JPG, TXT'

// ── Form payload ───────────────────────────────────────────────────────────

export interface ContactFormPayload {
  name:        string
  email:       string
  projectType: ProjectType | ''
  budget:      BudgetRange | ''
  message:     string
  /** Honeypot — must be empty on real submissions */
  honeypot:    string
  /** Optional file attachment (base64 encoded) */
  attachment?: AttachmentMeta
}

// ── Validation ─────────────────────────────────────────────────────────────

export type ContactFormField = 'name' | 'email' | 'projectType' | 'message'

export type ContactFormErrors = Partial<Record<ContactFormField, string>>

export interface ValidationResult {
  valid:  boolean
  errors: ContactFormErrors
}

// ── Service layer ──────────────────────────────────────────────────────────

export type ContactFailureCause =
  | 'EMAILJS_NOT_CONFIGURED'
  | 'RATE_LIMITED'
  | 'DUPLICATE'
  | 'HONEYPOT'
  | 'NETWORK_ERROR'
  | 'ATTACHMENT_TOO_LARGE'
  | 'UNKNOWN'

export interface ContactServiceResult {
  ok:       boolean
  message:  string
  /** Stable cause code for programmatic handling */
  cause?:   ContactFailureCause | unknown
  /** EmailJS response ID on success */
  emailId?: string
  /** Which attempt succeeded (1 = first try) */
  attempt?: number
}

export interface ContactServiceConfig {
  serviceId:         string
  /** Admin notification template */
  adminTemplateId:   string
  /** Auto-reply template sent to the visitor */
  replyTemplateId:   string | null
  publicKey:         string
}

// ── Rate-limit state (persisted to sessionStorage) ─────────────────────────

export interface RateLimitState {
  lastSentAt:  string
  sendCount:   number
  windowStart: string
}

// ── Spam scoring ───────────────────────────────────────────────────────────

export interface SpamScore {
  score:   number   // 0–100
  reasons: string[]
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
  { value: 'under-10k', label: 'Under ₹10,000'          },
  { value: '10k-25k',   label: '₹10,000 – ₹25,000'      },
  { value: '25k-50k',   label: '₹25,000 – ₹50,000'      },
  { value: '50k-1L',    label: '₹50,000 – ₹1,00,000'    },
  { value: '1L-plus',   label: '₹1,00,000+'              },
  { value: 'discuss',   label: "Let's discuss"           },
]
