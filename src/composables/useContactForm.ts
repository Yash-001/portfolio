/**
 * useContactForm
 *
 * Composable that owns the entire contact form lifecycle:
 *  - Reactive form state
 *  - Field-level and full-form validation
 *  - Submission with loading / success / error states
 *  - Duplicate-submit guard (in-flight lock)
 *  - Toast notifications via PrimeVue ToastService
 *  - Focus management on error
 *  - Form reset on success, value preservation on failure
 */

import { reactive, ref, computed, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import { submitContactForm } from '@/services/contact.service'
import type {
  ContactFormPayload,
  ContactFormErrors,
  ContactFormField,
  ContactStatus,
  ValidationResult,
} from '@/types/contact.types'

// ── Validation rules ───────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateName(value: string): string | undefined {
  const v = value.trim()
  if (!v)           return 'Full name is required.'
  if (v.length < 2) return 'Name must be at least 2 characters.'
  if (v.length > 100) return 'Name must be under 100 characters.'
  return undefined
}

function validateEmail(value: string): string | undefined {
  const v = value.trim()
  if (!v)               return 'Email address is required.'
  if (!EMAIL_RE.test(v)) return 'Please enter a valid email address.'
  return undefined
}

function validateProjectType(value: string): string | undefined {
  if (!value) return 'Please select a project type.'
  return undefined
}

function validateMessage(value: string): string | undefined {
  const v = value.trim()
  if (!v)             return 'Message is required.'
  if (v.length < 20)  return 'Message must be at least 20 characters.'
  if (v.length > 1000) return 'Message must be under 1000 characters.'
  return undefined
}

const VALIDATORS: Record<ContactFormField, (v: string) => string | undefined> = {
  name:        validateName,
  email:       validateEmail,
  projectType: validateProjectType,
  message:     validateMessage,
}

const REQUIRED_FIELDS: ContactFormField[] = ['name', 'email', 'projectType', 'message']

// ── Composable ─────────────────────────────────────────────────────────────

export function useContactForm() {
  const toast = useToast()

  // ── State ────────────────────────────────────────────────────────────────

  const form = reactive<ContactFormPayload>({
    name:        '',
    email:       '',
    projectType: '',
    budget:      '',
    message:     '',
    honeypot:    '',
  })

  const errors   = reactive<ContactFormErrors>({})
  const touched  = reactive<Partial<Record<ContactFormField, boolean>>>({})
  const status   = ref<ContactStatus>('idle')
  const showSuccess = ref(false)

  /** Prevents double-submit while a request is in-flight */
  const isSubmitting = ref(false)

  // ── Derived ──────────────────────────────────────────────────────────────

  const isLoading  = computed(() => status.value === 'loading')
  const hasError   = computed(() => status.value === 'error')
  const charCount  = computed(() => form.message.length)
  const charWarn   = computed(() => charCount.value > 900)
  const isDisabled = computed(() => isSubmitting.value)

  // ── Validation ───────────────────────────────────────────────────────────

  function validateField(field: ContactFormField): void {
    const value = field === 'projectType'
      ? form.projectType
      : (form as unknown as Record<string, string>)[field]
    const result = VALIDATORS[field](value)
    if (result) {
      errors[field] = result
    } else {
      delete errors[field]
    }
  }

  function onBlur(field: ContactFormField): void {
    touched[field] = true
    validateField(field)
  }

  function validateAll(): ValidationResult {
    REQUIRED_FIELDS.forEach((f) => {
      touched[f] = true
      validateField(f)
    })
    const valid = REQUIRED_FIELDS.every((f) => !errors[f])
    return { valid, errors: { ...errors } }
  }

  // ── Focus management ─────────────────────────────────────────────────────

  async function focusFirstError(): Promise<void> {
    await nextTick()
    const fieldOrder: ContactFormField[] = ['name', 'email', 'projectType', 'message']
    for (const field of fieldOrder) {
      if (errors[field]) {
        const idMap: Record<ContactFormField, string> = {
          name:        'cs-name',
          email:       'cs-email',
          projectType: 'cs-type',
          message:     'cs-message',
        }
        const el = document.getElementById(idMap[field])
        el?.focus()
        break
      }
    }
  }

  // ── Reset ────────────────────────────────────────────────────────────────

  function resetForm(): void {
    form.name        = ''
    form.email       = ''
    form.projectType = ''
    form.budget      = ''
    form.message     = ''
    form.honeypot    = ''
    REQUIRED_FIELDS.forEach((f) => {
      delete errors[f]
      delete touched[f]
    })
    status.value = 'idle'
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(): Promise<void> {
    // Guard: prevent double-submit
    if (isSubmitting.value) return

    // Validate all fields
    const { valid } = validateAll()
    if (!valid) {
      await focusFirstError()
      toast.add({
        severity: 'warn',
        summary:  'Check your form',
        detail:   'Please fix the highlighted fields before sending.',
        life:     4000,
      })
      return
    }

    isSubmitting.value = true
    status.value       = 'loading'

    const result = await submitContactForm({ ...form })

    if (result.ok) {
      status.value      = 'success'
      showSuccess.value = true
      resetForm()
      // status reset happens after dialog closes — keep 'success' for aria-live
    } else {
      status.value = 'error'
      isSubmitting.value = false

      // Distinguish rate-limit / dedup from generic errors
      const isRateLimit = result.message.includes('Too many') || result.message.includes('already sent')
      const isConfig    = result.cause === 'EMAILJS_NOT_CONFIGURED'

      toast.add({
        severity: 'error',
        summary:  isRateLimit ? 'Slow down' : isConfig ? 'Not configured' : 'Send failed',
        detail:   result.message,
        life:     isRateLimit ? 8000 : 6000,
      })
    }
  }

  function onDialogClose(): void {
    showSuccess.value  = false
    isSubmitting.value = false
    status.value       = 'idle'
  }

  return {
    // State
    form,
    errors,
    touched,
    status,
    showSuccess,
    // Derived
    isLoading,
    hasError,
    isDisabled,
    charCount,
    charWarn,
    // Methods
    onBlur,
    validateField,
    handleSubmit,
    onDialogClose,
    resetForm,
  }
}
