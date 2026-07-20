<template>
  <Teleport to="body">
    <Transition name="dialog-backdrop">
      <div
        v-if="modelValue"
        class="cs-dialog-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cs-dialog-title"
        aria-describedby="cs-dialog-desc"
        @click.self="close"
      >
        <Transition name="dialog-panel">
          <div
            v-if="modelValue"
            ref="panelEl"
            class="cs-dialog"
            @keydown="onKeydown"
          >
            <!-- Close -->
            <button
              ref="closeBtn"
              class="cs-dialog__close"
              :aria-label="t('common.aria.closeDialog')"
              @click="close"
            >
              <i
                class="pi pi-times"
                style="font-size:12px;"
              />
            </button>

            <!-- Animated checkmark -->
            <div
              class="cs-dialog__icon-wrap"
              aria-hidden="true"
            >
              <svg
                :key="modelValue ? 'open' : 'closed'"
                class="cs-dialog__check-svg"
                viewBox="0 0 52 52"
              >
                <circle
                  class="cs-dialog__check-circle"
                  cx="26"
                  cy="26"
                  r="24"
                />
                <path
                  class="cs-dialog__check-tick"
                  d="M14 27l8 8 16-16"
                />
              </svg>
              <div class="cs-dialog__icon-glow" />
            </div>

            <!-- Copy -->
            <h3
              id="cs-dialog-title"
              class="cs-dialog__title"
            >
              {{ t('contact.success.title') }}
            </h3>
            <p
              id="cs-dialog-desc"
              class="cs-dialog__sub"
            >
              {{ t('contact.success.sub') }}
            </p>

            <!-- Meta -->
            <div class="cs-dialog__meta">
              <div class="cs-dialog__meta-item">
                <i
                  class="pi pi-clock"
                  aria-hidden="true"
                />
                <span>{{ t('contact.success.responseTime') }}</span>
              </div>
              <div class="cs-dialog__meta-item">
                <i
                  class="pi pi-map-marker"
                  aria-hidden="true"
                />
                <span>{{ APP_LOCATION }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="cs-dialog__actions">
              <a
                :href="SOCIAL_LINKS.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                class="cs-dialog__btn cs-dialog__btn--primary"
              >
                <i
                  class="pi pi-linkedin"
                  aria-hidden="true"
                />
                <span>{{ t('contact.success.connectBtn') }}</span>
              </a>
              <button
                class="cs-dialog__btn cs-dialog__btn--secondary"
                @click="close"
              >
                {{ t('contact.success.doneBtn') }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { SOCIAL_LINKS, APP_LOCATION } from '@/constants'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()

const props = defineProps<{ modelValue: boolean }>()
const emit  = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const panelEl  = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)

/** Element that had focus before the dialog opened — restored on close */
let previouslyFocused: HTMLElement | null = null

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function getFocusable(): HTMLElement[] {
  return panelEl.value
    ? Array.from(panelEl.value.querySelectorAll<HTMLElement>(FOCUSABLE))
    : []
}

function trapFocus(e: KeyboardEvent): void {
  const focusable = getFocusable()
  if (!focusable.length) return

  const first = focusable[0]
  const last  = focusable[focusable.length - 1]

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
  trapFocus(e)
}

function close(): void {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      await nextTick()
      closeBtn.value?.focus()
    } else {
      document.body.style.overflow = ''
      await nextTick()
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  },
)

// Safety: restore scroll + focus if component is destroyed while dialog is open
onUnmounted(() => {
  document.body.style.overflow = ''
  if (previouslyFocused) {
    previouslyFocused.focus()
    previouslyFocused = null
  }
})
</script>

<style scoped>
/* ── Backdrop ──────────────────────────────────────────────────── */
.cs-dialog-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}

/* ── Panel ─────────────────────────────────────────────────────── */
.cs-dialog {
  position: relative;
  width: 100%; max-width: 440px;
  border-radius: 24px;
  border: 1px solid rgba(99,102,241,0.2);
  background: rgba(17,17,17,0.98);
  backdrop-filter: blur(24px);
  padding: 48px 40px 40px;
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1);
}

.cs-dialog__close {
  position: absolute; top: 16px; right: 16px;
  width: 28px; height: 28px; border-radius: 8px;
  border: 1px solid #222; background: transparent;
  color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: border-color 0.2s, color 0.2s;
}
.cs-dialog__close:hover { border-color: #444; color: #a0a0a0; }
.cs-dialog__close:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* ── Animated checkmark ────────────────────────────────────────── */
.cs-dialog__icon-wrap {
  position: relative; width: 72px; height: 72px;
  display: flex; align-items: center; justify-content: center;
}

.cs-dialog__check-svg {
  width: 72px; height: 72px;
  fill: none; stroke-width: 2.5;
}

.cs-dialog__check-circle {
  stroke: #10b981;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-linecap: round;
  animation: drawCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.2s forwards;
}

.cs-dialog__check-tick {
  stroke: #10b981;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: drawTick 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.7s forwards;
}

@keyframes drawCircle { to { stroke-dashoffset: 0; } }
@keyframes drawTick   { to { stroke-dashoffset: 0; } }

.cs-dialog__icon-glow {
  position: absolute; inset: -8px; border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%);
  animation: glowPulse 2s ease-in-out 0.8s infinite;
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.1); }
}

/* ── Copy ──────────────────────────────────────────────────────── */
.cs-dialog__title {
  font-size: 24px; font-weight: 800; color: #f5f5f5; letter-spacing: -0.03em;
}
.cs-dialog__sub {
  font-size: 14px; line-height: 1.75; color: #737373; max-width: 340px;
}

/* ── Meta ──────────────────────────────────────────────────────── */
.cs-dialog__meta {
  display: flex; flex-direction: column; gap: 8px; width: 100%;
  padding: 16px; border-radius: 12px;
  border: 1px solid #1a1a1a; background: rgba(255,255,255,0.02);
}
.cs-dialog__meta-item {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-family: 'Geist Mono', monospace; color: #555;
}
.cs-dialog__meta-item i { color: #6366f1; font-size: 12px; }

/* ── Actions ───────────────────────────────────────────────────── */
.cs-dialog__actions {
  display: flex; flex-direction: column; gap: 10px; width: 100%;
}
.cs-dialog__btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px 20px; border-radius: 12px; font-size: 14px; font-weight: 600;
  text-decoration: none; cursor: pointer; transition: all 0.25s; letter-spacing: 0.02em;
  border: none; width: 100%;
}
.cs-dialog__btn:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
.cs-dialog__btn--primary {
  background: linear-gradient(135deg, #0077b5, #0a66c2);
  color: #fff; box-shadow: 0 4px 16px rgba(0,119,181,0.35);
}
.cs-dialog__btn--primary:hover { box-shadow: 0 8px 28px rgba(0,119,181,0.5); transform: translateY(-1px); }
.cs-dialog__btn--secondary {
  background: rgba(255,255,255,0.04); border: 1px solid #222; color: #737373;
}
.cs-dialog__btn--secondary:hover { border-color: #333; color: #a0a0a0; }

/* ── Transitions ───────────────────────────────────────────────── */
.dialog-backdrop-enter-active { transition: opacity 0.3s ease; }
.dialog-backdrop-leave-active { transition: opacity 0.25s ease; }
.dialog-backdrop-enter-from,
.dialog-backdrop-leave-to     { opacity: 0; }

.dialog-panel-enter-active { transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1); }
.dialog-panel-leave-active { transition: opacity 0.2s ease, transform 0.25s ease; }
.dialog-panel-enter-from   { opacity: 0; transform: scale(0.92) translateY(20px); }
.dialog-panel-leave-to     { opacity: 0; transform: scale(0.96); }
</style>
