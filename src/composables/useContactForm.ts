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
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { submitContactForm } from '@/services/contact.service'
import { useAnalytics } from '@/composables/useAnalytics'
import type {
  ContactFormPayload,
  ContactFormErrors,
  ContactFormField,
  ContactStatus,
  ValidationResult,
} from '@/types/contact.types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const REQUIRED_FIELDS: ContactFormField[] = ['name', 'email', 'projectType', 'message']

// ── Composable ─────────────────────────────────────────────────────────────

export function useContactForm() {
  const toast = useToast()
  const { t } = useI18n()
  const { trackContactStart, trackContactSubmit } = useAnalytics()

  // ── Validation helpers (use t() for messages) ────────────────────────────

  function validateName(value: string): string | undefined {
    const v = value.trim()
    if (!v)             return t('contact.form.errors.nameRequired')
    if (v.length < 2)   return t('contact.form.errors.nameMin')
    if (v.length > 100) return t('contact.form.errors.nameMax')
    return undefined
  }

  function validateEmail(value: string): string | undefined {
    const v = value.trim()
    if (!v)                return t('contact.form.errors.emailRequired')
    if (!EMAIL_RE.test(v)) return t('contact.form.errors.emailInvalid')
    return undefined
  }

  function validateProjectType(value: string): string | undefined {
    if (!value) return t('contact.form.errors.typeRequired')
    return undefined
  }

  function validateMessage(value: string): string | undefined {
    const v = value.trim()
    if (!v)              return t('contact.form.errors.messageRequired')
    if (v.length < 20)   return t('contact.form.errors.messageMin')
    if (v.length > 1000) return t('contact.form.errors.messageMax')
    return undefined
  }

  const VALIDATORS: Record<ContactFormField, (v: string) => string | undefined> = {
    name:        validateName,
    email:       validateEmail,
    projectType: validateProjectType,
    message:     validateMessage,
  }

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

  /** Fires once when the user first interacts with the form */
  let _contactStarted = false
  function onContactStart(): void {
    if (_contactStarted) return
    _contactStarted = true
    trackContactStart()
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
        summary:  t('contact.form.toast.checkForm'),
        detail:   t('contact.form.toast.fixFields'),
        life:     4000,
      })
      return
    }

    isSubmitting.value = true
    status.value       = 'loading'

    const result = await submitContactForm({ ...form })

    if (result.ok) {
      trackContactSubmit(true)
      status.value      = 'success'
      showSuccess.value = true
      resetForm()
      // status reset happens after dialog closes — keep 'success' for aria-live
    } else {
      trackContactSubmit(false)
      status.value = 'error'
      isSubmitting.value = false

      // Distinguish rate-limit / dedup from generic errors
      const isRateLimit = result.message.includes('Too many') || result.message.includes('already sent')
      const isConfig    = result.cause === 'EMAILJS_NOT_CONFIGURED'

      toast.add({
        severity: 'error',
        summary:  isRateLimit ? t('contact.form.toast.slowDown') : isConfig ? t('contact.form.toast.notConfig') : t('contact.form.toast.sendFailed'),
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
    onContactStart,
  }
}
