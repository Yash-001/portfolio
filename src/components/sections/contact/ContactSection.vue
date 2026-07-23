<template>
  <section
    id="contact"
    ref="sectionEl"
    class="cs"
    aria-label="Contact"
  >
    <!-- Background -->
    <div
      class="cs__bg"
      aria-hidden="true"
    >
      <div class="cs-orb cs-orb--1" />
      <div class="cs-orb cs-orb--2" />
      <div class="cs-grid" />
    </div>

    <div class="cs__inner">
      <!-- ── Left: Info panel ─────────────────────────────────── -->
      <div
        ref="infoEl"
        class="cs-info"
      >
        <div class="cs-info__label">
          <span class="cs-label-line" />
          <span class="cs-label-text">{{ t('contact.label') }}</span>
        </div>

        <h2 class="cs-info__heading">
          {{ t('contact.heading') }}<br />
          <span class="cs-heading-accent">{{ t('contact.headingAccent') }}</span>
        </h2>

        <p class="cs-info__sub">
          {{ t('contact.sub') }}
        </p>

        <!-- Availability -->
        <div class="cs-info__avail">
          <span
            class="cs-avail-dot"
            aria-hidden="true"
          />
          <span>{{ APP_AVAILABILITY_TEXT }}</span>
          <span class="cs-avail-sep">·</span>
          <span class="cs-avail-tz">{{ APP_LOCATION }}</span>
        </div>

        <!-- Contact details -->
        <ul
          class="cs-details"
          aria-label="Contact details"
        >
          <li class="cs-detail">
            <span class="cs-detail__icon"><i class="pi pi-envelope" /></span>
            <div>
              <span class="cs-detail__label">{{ t('contact.details.email') }}</span>
              <a
                :href="`mailto:${APP_EMAIL}`"
                class="cs-detail__value"
              >{{ APP_EMAIL }}</a>
            </div>
          </li>
          <li class="cs-detail">
            <span class="cs-detail__icon"><i class="pi pi-map-marker" /></span>
            <div>
              <span class="cs-detail__label">{{ t('contact.details.location') }}</span>
              <span class="cs-detail__value">{{ APP_LOCATION }}</span>
            </div>
          </li>
          <li class="cs-detail">
            <span class="cs-detail__icon"><i class="pi pi-clock" /></span>
            <div>
              <span class="cs-detail__label">{{ t('contact.details.responseTime') }}</span>
              <span class="cs-detail__value">{{ t('contact.details.within', { time: APP_RESPONSE_TIME }) }}</span>
            </div>
          </li>
        </ul>

        <!-- Social icons -->
        <div
          class="cs-socials"
          role="list"
          aria-label="Social links"
        >
          <a
            :href="SOCIAL_LINKS.github"
            target="_blank"
            rel="noopener noreferrer"
            class="cs-social"
            aria-label="GitHub profile"
            role="listitem"
          ><i class="pi pi-github" /></a>
          <a
            :href="SOCIAL_LINKS.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="cs-social"
            aria-label="LinkedIn profile"
            role="listitem"
          ><i class="pi pi-linkedin" /></a>
          <a
            :href="SOCIAL_LINKS.email"
            class="cs-social"
            aria-label="Send email"
            role="listitem"
          ><i class="pi pi-envelope" /></a>
        </div>

        <!-- Calendly CTA -->
        <div class="cs-calendly-row">
          <CalendlyPopup
            :label="t('common.cta.bookCall')"
            variant="ghost"
            size="md"
            :show-availability="true"
          />
          <button
            type="button"
            class="cs-inline-toggle"
            :aria-expanded="showInline"
            aria-controls="cs-inline-embed"
            @click="showInline = !showInline"
          >
            <i :class="showInline ? 'pi pi-chevron-up' : 'pi pi-calendar-plus'" />
            <span>{{ showInline ? t('common.misc.hide') : t('contact.calendly.viewSchedule') }}</span>
          </button>
        </div>
      </div>

      <!-- ── Right: Form ──────────────────────────────────────── -->
      <div
        ref="formWrapEl"
        class="cs-form-wrap"
      >
        <div class="cs-form-card">
          <form
            id="contact-form"
            novalidate
            aria-label="Contact form"
            aria-describedby="cs-form-status"
            @submit.prevent="handleSubmit"
          >
            <!-- Screen-reader live region for form status -->
            <div
              id="cs-form-status"
              class="sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <template v-if="isLoading">{{ t('common.status.sending') }}</template>
              <template v-else-if="status === 'success'">{{ t('common.status.messageSent') }}</template>
              <template v-else-if="hasError">{{ t('common.status.sendFailed') }}</template>
            </div>

            <!-- Honeypot — visually hidden, never filled by real users -->
            <input
              v-model="form.honeypot"
              type="text"
              name="website"
              tabindex="-1"
              aria-hidden="true"
              class="cs-honeypot"
              autocomplete="off"
            />

            <!-- Name -->
            <div
              class="cs-field"
              :class="{ 'cs-field--error': errors.name && touched.name }"
            >
              <label class="cs-field__label" for="cs-name">{{ t('contact.form.name') }} <span aria-hidden="true">*</span></label>
              <input
                id="cs-name"
                v-model="form.name"
                type="text"
                class="cs-input"
              :placeholder="t('contact.form.placeholder.name')"
                autocomplete="name"
                :aria-invalid="!!(errors.name && touched.name)"
                :aria-describedby="errors.name && touched.name ? 'cs-name-err' : undefined"
                :disabled="isDisabled"
                @focus="onContactStart"
                @blur="onBlur('name')"
              />
              <span
                v-if="errors.name && touched.name"
                id="cs-name-err"
                class="cs-field__error"
                role="alert"
              >{{ errors.name }}</span>
            </div>

            <!-- Email -->
            <div
              class="cs-field"
              :class="{ 'cs-field--error': errors.email && touched.email }"
            >
              <label class="cs-field__label" for="cs-email">{{ t('contact.form.email') }} <span aria-hidden="true">*</span></label>
              <input
                id="cs-email"
                v-model="form.email"
                type="email"
                class="cs-input"
              :placeholder="t('contact.form.placeholder.email')"
                autocomplete="email"
                :aria-invalid="!!(errors.email && touched.email)"
                :aria-describedby="errors.email && touched.email ? 'cs-email-err' : undefined"
                :disabled="isDisabled"
                @blur="onBlur('email')"
              />
              <span
                v-if="errors.email && touched.email"
                id="cs-email-err"
                class="cs-field__error"
                role="alert"
              >{{ errors.email }}</span>
            </div>

            <!-- Project type + Budget row -->
            <div class="cs-row">
              <div
                class="cs-field"
                :class="{ 'cs-field--error': errors.projectType && touched.projectType }"
              >
              <label class="cs-field__label" for="cs-type">{{ t('contact.form.projectType') }} <span aria-hidden="true">*</span></label>
                <select
                  id="cs-type"
                  v-model="form.projectType"
                  class="cs-input cs-select"
                  :aria-invalid="!!(errors.projectType && touched.projectType)"
                  :aria-describedby="errors.projectType && touched.projectType ? 'cs-type-err' : undefined"
                  :disabled="isDisabled"
                  @blur="onBlur('projectType')"
                >
                  <option value="" disabled>{{ t('contact.form.selectType') }}</option>
                  <option
                    v-for="o in PROJECT_TYPE_OPTIONS"
                    :key="o.value"
                    :value="o.value"
                  >
                    {{ o.label }}
                  </option>
                </select>
                <span
                  v-if="errors.projectType && touched.projectType"
                  id="cs-type-err"
                  class="cs-field__error"
                  role="alert"
                >{{ errors.projectType }}</span>
              </div>

              <div class="cs-field">
              <label class="cs-field__label" for="cs-budget">{{ t('contact.form.budget') }}</label>
                <select
                  id="cs-budget"
                  v-model="form.budget"
                  class="cs-input cs-select"
                  :disabled="isDisabled"
                >
                  <option value="" disabled>{{ t('contact.form.selectRange') }}</option>
                  <option
                    v-for="o in BUDGET_OPTIONS"
                    :key="o.value"
                    :value="o.value"
                  >
                    {{ o.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Message -->
            <div
              class="cs-field"
              :class="{ 'cs-field--error': errors.message && touched.message }"
            >
              <label class="cs-field__label" for="cs-message">{{ t('contact.form.message') }} <span aria-hidden="true">*</span></label>
              <textarea
                id="cs-message"
                v-model="form.message"
                class="cs-input cs-textarea"
              :placeholder="t('contact.form.placeholder.message')"
                rows="5"
                :aria-invalid="!!(errors.message && touched.message)"
                :aria-describedby="errors.message && touched.message ? 'cs-msg-err' : undefined"
                :disabled="isDisabled"
                @blur="onBlur('message')"
              />
              <span
                v-if="errors.message && touched.message"
                id="cs-msg-err"
                class="cs-field__error"
                role="alert"
              >{{ errors.message }}</span>
              <span
                class="cs-field__count"
                :class="{ 'cs-field__count--warn': charWarn }"
                aria-live="polite"
              >
                {{ charCount }}/1000
              </span>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="cs-submit"
              :class="{ 'cs-submit--loading': isLoading }"
              :disabled="isDisabled"
              :aria-busy="isLoading"
            >
              <span
                v-if="isLoading"
                class="cs-submit__spinner"
                aria-hidden="true"
              />
              <i
                v-else
                class="pi pi-send"
                aria-hidden="true"
              />
              <span>{{ isLoading ? t('common.cta.sending') : t('common.cta.sendMessage') }}</span>
            </button>

            <!-- Inline error banner (shown below button on failure) -->
            <Transition name="cs-error-fade">
              <div
                v-if="hasError"
                class="cs-form-error"
                role="alert"
                aria-live="assertive"
              >
                <i
                  class="pi pi-exclamation-circle"
                  aria-hidden="true"
                />
                <span>{{ t('common.errors.sendFailed') }}
                  <a :href="`mailto:${APP_EMAIL}`" class="cs-form-error__link">{{ t('common.errors.emailDirect') }}</a>.
                </span>
              </div>
            </Transition>
          </form>
        </div>
      </div>
    </div>

    <!-- ── Inline Calendly embed ── full width, below both columns ── -->
    <Transition name="cs-inline-slide">
      <div
        v-if="showInline"
        id="cs-inline-embed"
        class="cs-inline-wrap"
      >
        <CalendlyInline min-height="700px" />
      </div>
    </Transition>

    <!-- Success dialog -->
    <ContactSuccessDialog
      :model-value="showSuccess"
      @update:model-value="onDialogClose"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'
import {
  APP_EMAIL, APP_LOCATION, APP_AVAILABILITY_TEXT, APP_RESPONSE_TIME,
  SOCIAL_LINKS,
} from '@/constants/app.constants'
import { PROJECT_TYPE_OPTIONS, BUDGET_OPTIONS } from '@/types/contact.types'
import { useContactForm } from '@/composables/useContactForm'
import ContactSuccessDialog from './ContactSuccessDialog.vue'
import CalendlyPopup from '@/components/ui/overlay/CalendlyPopup.vue'
import CalendlyInline from '@/components/ui/overlay/CalendlyInline.vue'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()

const showInline = ref(false)

const {
  form, errors, touched, status,
  showSuccess, isLoading, hasError, isDisabled,
  charCount, charWarn,
  onBlur, handleSubmit, onDialogClose, onContactStart,
} = useContactForm()

// ── GSAP entrance ──────────────────────────────────────────────
const sectionEl  = ref<HTMLElement | null>(null)
const infoEl     = ref<HTMLElement | null>(null)
const formWrapEl = ref<HTMLElement | null>(null)

let gsapCtx: ReturnType<typeof gsap.context> | null = null

onMounted(() => {
  gsapCtx = gsap.context(() => {
    const ease = 'power3.out'
    gsap.fromTo(infoEl.value,
      { opacity: 0, x: -40 },
      { scrollTrigger: { trigger: infoEl.value, start: 'top 85%', once: true },
        opacity: 1, x: 0, duration: 0.9, ease, clearProps: 'all' },
    )
    gsap.fromTo(formWrapEl.value,
      { opacity: 0, x: 40 },
      { scrollTrigger: { trigger: formWrapEl.value, start: 'top 85%', once: true },
        opacity: 1, x: 0, duration: 0.9, ease, delay: 0.1, clearProps: 'all' },
    )
  }, sectionEl.value!)
})

onUnmounted(() => gsapCtx?.revert())
</script>

<style scoped>
/* ── Shell ─────────────────────────────────────────────────────── */
.cs {
  position: relative;
  padding: 120px 0 100px;
  background: #0a0a0a;
  overflow: hidden;
}

/* ── Background ────────────────────────────────────────────────── */
.cs__bg { position: absolute; inset: 0; pointer-events: none; }

.cs-orb {
  position: absolute; border-radius: 50%;
  filter: blur(120px); pointer-events: none;
}
.cs-orb--1 {
  width: 600px; height: 600px; top: -100px; right: -100px;
  background: radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%);
  animation: csOrb 16s ease-in-out infinite;
}
.cs-orb--2 {
  width: 500px; height: 500px; bottom: -80px; left: -80px;
  background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%);
  animation: csOrb 20s ease-in-out infinite reverse;
}
@keyframes csOrb {
  0%, 100% { transform: translate(0,0); }
  50%       { transform: translate(40px,-50px); }
}

.cs-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

/* ── Layout ────────────────────────────────────────────────────── */
.cs__inner {
  max-width: 1280px; margin: 0 auto; padding: 0 24px;
  display: grid; grid-template-columns: 1fr; gap: 64px;
}
@media (min-width: 1024px) {
  .cs__inner { grid-template-columns: 1fr 1fr; align-items: start; gap: 80px; }
}

/* ── Info panel ────────────────────────────────────────────────── */
.cs-info { display: flex; flex-direction: column; gap: 24px; }

.cs-info__label { display: flex; align-items: center; gap: 16px; }
.cs-label-line  { display: block; width: 40px; height: 1px; background: #6366f1; }
.cs-label-text  {
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: #6366f1; font-family: 'Geist Mono', monospace;
}

.cs-info__heading {
  font-size: clamp(32px, 4vw, 52px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.1; color: #f5f5f5;
}
.cs-heading-accent {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.cs-info__sub { font-size: 15px; line-height: 1.75; color: #737373; max-width: 44ch; }

/* Availability */
.cs-info__avail {
  display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 8px 16px; border-radius: 100px; width: fit-content;
  border: 1px solid rgba(16,185,129,0.2); background: rgba(16,185,129,0.05);
  font-size: 12px; font-weight: 600; color: #10b981;
}
.cs-avail-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #10b981;
  box-shadow: 0 0 8px rgba(16,185,129,0.6);
  animation: availPulse 2s ease-in-out infinite;
}
@keyframes availPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(16,185,129,0.6); }
  50%       { box-shadow: 0 0 14px rgba(16,185,129,0.9); }
}
.cs-avail-sep { color: rgba(16,185,129,0.3); }
.cs-avail-tz  { font-family: 'Geist Mono', monospace; font-size: 11px; color: #4ade80; opacity: 0.7; }

/* Contact details */
.cs-details { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }

.cs-detail {
  display: flex; align-items: flex-start; gap: 14px;
}
.cs-detail__icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03);
  display: flex; align-items: center; justify-content: center;
  color: #6366f1; font-size: 14px;
}
.cs-detail__label {
  display: block; font-size: 11px; font-family: 'Geist Mono', monospace;
  color: #555; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px;
}
.cs-detail__value {
  font-size: 14px; color: #d4d4d4; text-decoration: none;
  transition: color 0.2s;
}
a.cs-detail__value:hover { color: #a5b4fc; }

/* Socials */
.cs-socials { display: flex; gap: 8px; }
.cs-social {
  width: 38px; height: 38px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03);
  display: flex; align-items: center; justify-content: center;
  color: #737373; font-size: 15px; text-decoration: none;
  transition: all 0.22s;
}
.cs-social:hover {
  border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.1);
  color: #a5b4fc; transform: translateY(-2px);
}
.cs-social:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Calendly row */
.cs-calendly-row {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}

.cs-inline-toggle {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 16px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03);
  color: #737373; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.22s;
}
.cs-inline-toggle:hover {
  border-color: rgba(99,102,241,0.3); color: #a5b4fc;
  background: rgba(99,102,241,0.06);
}
.cs-inline-toggle:focus-visible {
  outline: 2px solid #6366f1; outline-offset: 2px;
}

/* Inline embed slide transition */
.cs-inline-slide-enter-active { transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1); }
.cs-inline-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.cs-inline-slide-enter-from  { opacity: 0; transform: translateY(-12px); }
.cs-inline-slide-leave-to    { opacity: 0; transform: translateY(-8px); }

/* Full-width inline embed container */
.cs-inline-wrap {
  max-width: 1280px; margin: 0 auto; padding: 0 24px;
  margin-top: 48px;
}

/* ── Form card ─────────────────────────────────────────────────── */
.cs-form-wrap { position: relative; }

.cs-form-card {
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(17,17,17,0.92);
  backdrop-filter: blur(20px);
  padding: 40px;
  display: flex; flex-direction: column; gap: 0;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4);
}
@media (max-width: 480px) { .cs-form-card { padding: 24px; } }

/* ── Fields ────────────────────────────────────────────────────── */
.cs-field {
  display: flex; flex-direction: column; gap: 6px;
  margin-bottom: 20px; position: relative;
}
.cs-field--error .cs-input { border-color: rgba(239,68,68,0.5); }

.cs-field__label {
  font-size: 12px; font-weight: 600; color: #a0a0a0;
  font-family: 'Geist Mono', monospace; letter-spacing: 0.04em;
}
.cs-field__label span { color: #6366f1; }

.cs-input {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; padding: 11px 14px;
  font-size: 14px; color: #e5e5e5; font-family: inherit;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}
.cs-input::placeholder { color: #444; }
.cs-input:focus {
  border-color: rgba(99,102,241,0.5);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}
.cs-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cs-select { appearance: none; cursor: pointer; }
.cs-select option { background: #111; color: #e5e5e5; }

.cs-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }

.cs-field__error { font-size: 12px; color: #f87171; }

.cs-field__count {
  font-size: 11px; color: #444; font-family: 'Geist Mono', monospace;
  text-align: right; margin-top: 2px;
}
.cs-field__count--warn { color: #f87171; }

/* Row */
.cs-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 480px) { .cs-row { grid-template-columns: 1fr; } }

/* ── Submit ─────────────────────────────────────────────────────── */
.cs-submit {
  display: flex; align-items: center; justify-content: center; gap: 9px;
  width: 100%; padding: 14px 24px; border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none; color: #fff; font-size: 15px; font-weight: 700;
  cursor: pointer; letter-spacing: 0.02em;
  box-shadow: 0 4px 20px rgba(99,102,241,0.35);
  transition: all 0.25s;
}
.cs-submit:hover:not(:disabled) {
  box-shadow: 0 8px 32px rgba(99,102,241,0.55); transform: translateY(-2px);
}
.cs-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

.cs-submit__spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Error banner ───────────────────────────────────────────────── */
.cs-form-error {
  display: flex; align-items: flex-start; gap: 8px;
  margin-top: 12px; padding: 12px 14px; border-radius: 10px;
  border: 1px solid rgba(239,68,68,0.25); background: rgba(239,68,68,0.06);
  font-size: 13px; color: #f87171; line-height: 1.5;
}
.cs-form-error i { font-size: 14px; flex-shrink: 0; margin-top: 1px; }
.cs-form-error__link {
  color: #fca5a5; text-decoration: underline; text-underline-offset: 2px;
  transition: color 0.2s;
}
.cs-form-error__link:hover { color: #fff; }

.cs-error-fade-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.cs-error-fade-leave-active { transition: opacity 0.2s ease; }
.cs-error-fade-enter-from   { opacity: 0; transform: translateY(-6px); }
.cs-error-fade-leave-to     { opacity: 0; }

/* ── Honeypot ───────────────────────────────────────────────────── */
.cs-honeypot {
  position: absolute; left: -9999px; opacity: 0;
  width: 1px; height: 1px; pointer-events: none;
}

/* ── Screen-reader only ─────────────────────────────────────────── */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
</style>
