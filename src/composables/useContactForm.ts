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
import {
  ATTACHMENT_MAX_SIZE,
  ATTACHMENT_MAX_SIZE_MB,
} from '@/types/contact.types'

const EMAIL_RE        = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const REQUIRED_FIELDS: ContactFormField[] = ['name', 'email', 'projectType', 'message']

export function useContactForm() {
  const toast = useToast()
  const { t } = useI18n()
  const { trackContactStart, trackContactSubmit } = useAnalytics()

  // ── Validators ────────────────────────────────────────────────────────────

  function validateName(v: string): string | undefined {
    const s = v.trim()
    if (!s)           return t('contact.form.errors.nameRequired')
    if (s.length < 2) return t('contact.form.errors.nameMin')
    if (s.length > 100) return t('contact.form.errors.nameMax')
  }

  function validateEmail(v: string): string | undefined {
    const s = v.trim()
    if (!s)                return t('contact.form.errors.emailRequired')
    if (!EMAIL_RE.test(s)) return t('contact.form.errors.emailInvalid')
  }

  function validateProjectType(v: string): string | undefined {
    if (!v) return t('contact.form.errors.typeRequired')
  }

  function validateMessage(v: string): string | undefined {
    const s = v.trim()
    if (!s)              return t('contact.form.errors.messageRequired')
    if (s.length < 20)   return t('contact.form.errors.messageMin')
    if (s.length > 1000) return t('contact.form.errors.messageMax')
  }

  const VALIDATORS: Record<ContactFormField, (v: string) => string | undefined> = {
    name:        validateName,
    email:       validateEmail,
    projectType: validateProjectType,
    message:     validateMessage,
  }

  // ── State ─────────────────────────────────────────────────────────────────

  const form = reactive<ContactFormPayload>({
    name:        '',
    email:       '',
    projectType: '',
    budget:      '',
    message:     '',
    honeypot:    '',
    attachment:  undefined,
  })

  const errors      = reactive<ContactFormErrors>({})
  const touched     = reactive<Partial<Record<ContactFormField, boolean>>>({})
  const status      = ref<ContactStatus>('idle')
  const showSuccess = ref(false)
  const isSubmitting = ref(false)

  // Attachment state
  const attachmentError   = ref<string | null>(null)
  const attachmentLoading = ref(false)

  // Retry feedback
  const retryAttempt = ref(0)

  // ── Derived ───────────────────────────────────────────────────────────────

  const isLoading  = computed(() => status.value === 'loading')
  const hasError   = computed(() => status.value === 'error')
  const charCount  = computed(() => form.message.length)
  const charWarn   = computed(() => charCount.value > 900)
  const isDisabled = computed(() => isSubmitting.value)

  // ── Field validation ──────────────────────────────────────────────────────

  function validateField(field: ContactFormField): void {
    const value = (form as unknown as Record<string, string>)[field] ?? ''
    const result = VALIDATORS[field](value)
    if (result) errors[field] = result
    else        delete errors[field]
  }

  function onBlur(field: ContactFormField): void {
    touched[field] = true
    validateField(field)
  }

  function validateAll(): ValidationResult {
    REQUIRED_FIELDS.forEach((f) => { touched[f] = true; validateField(f) })
    return { valid: REQUIRED_FIELDS.every((f) => !errors[f]), errors: { ...errors } }
  }

  // ── Attachment handling ───────────────────────────────────────────────────

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  async function setAttachment(file: File | null): Promise<void> {
    attachmentError.value = null
    form.attachment       = undefined

    if (!file) return

    if (file.size > ATTACHMENT_MAX_SIZE) {
      attachmentError.value = t('contact.form.errors.attachmentTooLarge', { mb: ATTACHMENT_MAX_SIZE_MB })
      return
    }

    attachmentLoading.value = true
    try {
      const dataUrl: string = await readFileAsDataUrl(file)
      form.attachment = {
        name:    file.name,
        size:    file.size,
        type:    file.type,
        dataUrl,
      }
    } catch {
      attachmentError.value = t('contact.form.errors.attachmentReadFailed')
    } finally {
      attachmentLoading.value = false
    }
  }

  function removeAttachment(): void {
    form.attachment       = undefined
    attachmentError.value = null
  }

  // ── Focus management ──────────────────────────────────────────────────────

  async function focusFirstError(): Promise<void> {
    await nextTick()
    const idMap: Record<ContactFormField, string> = {
      name: 'cs-name', email: 'cs-email', projectType: 'cs-type', message: 'cs-message',
    }
    for (const field of REQUIRED_FIELDS) {
      if (errors[field]) { document.getElementById(idMap[field])?.focus(); break }
    }
  }

  // ── Contact start tracking ────────────────────────────────────────────────

  let _started = false
  function onContactStart(): void {
    if (_started) return
    _started = true
    trackContactStart()
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  function resetForm(): void {
    form.name = ''; form.email = ''; form.projectType = ''
    form.budget = ''; form.message = ''; form.honeypot = ''
    form.attachment = undefined
    attachmentError.value = null
    retryAttempt.value    = 0
    REQUIRED_FIELDS.forEach((f) => { delete errors[f]; delete touched[f] })
    status.value = 'idle'
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(): Promise<void> {
    if (isSubmitting.value) return

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
    retryAttempt.value = 0

    const result = await submitContactForm({ ...form })

    if (result.ok) {
      trackContactSubmit(true)
      status.value      = 'success'
      showSuccess.value = true
      resetForm()
    } else {
      trackContactSubmit(false)
      status.value       = 'error'
      isSubmitting.value = false

      const isRateLimit = result.cause === 'RATE_LIMITED'
      const isDuplicate = result.cause === 'DUPLICATE'
      const isConfig    = result.cause === 'EMAILJS_NOT_CONFIGURED'

      toast.add({
        severity: 'error',
        summary:  isRateLimit || isDuplicate
          ? t('contact.form.toast.slowDown')
          : isConfig
            ? t('contact.form.toast.notConfig')
            : t('contact.form.toast.sendFailed'),
        detail: result.message,
        life:   isRateLimit || isDuplicate ? 8000 : 6000,
      })
    }
  }

  function onDialogClose(): void {
    showSuccess.value  = false
    isSubmitting.value = false
    status.value       = 'idle'
  }

  return {
    form,
    errors,
    touched,
    status,
    showSuccess,
    isLoading,
    hasError,
    isDisabled,
    charCount,
    charWarn,
    attachmentError,
    attachmentLoading,
    retryAttempt,
    onBlur,
    validateField,
    handleSubmit,
    onDialogClose,
    resetForm,
    onContactStart,
    setAttachment,
    removeAttachment,
  }
}
