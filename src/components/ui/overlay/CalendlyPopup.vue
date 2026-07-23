<template>
  <button
    type="button"
    class="cal-popup-btn"
    :class="[`cal-popup-btn--${variant}`, `cal-popup-btn--${size}`, { 'cal-popup-btn--loading': isLoading }]"
    :disabled="isLoading"
    :aria-busy="isLoading"
    :aria-label="label"
    @click="handleClick"
  >
    <span
      v-if="isLoading"
      class="cal-popup-btn__spinner"
      aria-hidden="true"
    />
    <template v-else>
      <i
        class="pi pi-calendar"
        aria-hidden="true"
      />
      <span>{{ label }}</span>
      <span
        v-if="showAvailability && availability === 'available'"
        class="cal-popup-btn__dot"
        aria-hidden="true"
      />
    </template>
  </button>
</template>

<script setup lang="ts">
import { useCalendly } from '@/composables/useCalendly'

interface Props {
  label?:           string
  variant?:         'primary' | 'outline' | 'ghost'
  size?:            'sm' | 'md' | 'lg'
  showAvailability?: boolean
}

withDefaults(defineProps<Props>(), {
  label:            'Book a Call',
  variant:          'primary',
  size:             'md',
  showAvailability: true,
})

const { isLoading, availability, openPopup } = useCalendly()

async function handleClick(): Promise<void> {
  await openPopup()
}
</script>

<style scoped>
.cal-popup-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
  border: none;
  position: relative;
  text-decoration: none;
}

.cal-popup-btn:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.cal-popup-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

/* ── Sizes ── */
.cal-popup-btn--sm { padding: 8px 16px;  font-size: 13px; }
.cal-popup-btn--md { padding: 12px 22px; font-size: 14px; }
.cal-popup-btn--lg { padding: 14px 28px; font-size: 15px; }

/* ── Variants ── */
.cal-popup-btn--primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 20px rgba(99,102,241,0.35);
}
.cal-popup-btn--primary:hover:not(:disabled) {
  box-shadow: 0 8px 32px rgba(99,102,241,0.55);
  transform: translateY(-2px);
}

.cal-popup-btn--outline {
  background: transparent;
  color: #a5b4fc;
  border: 1px solid rgba(99,102,241,0.35) !important;
}
.cal-popup-btn--outline:hover:not(:disabled) {
  border-color: rgba(99,102,241,0.6) !important;
  background: rgba(99,102,241,0.08);
  transform: translateY(-2px);
}

.cal-popup-btn--ghost {
  background: rgba(99,102,241,0.07);
  color: #a5b4fc;
  border: 1px solid rgba(99,102,241,0.2) !important;
}
.cal-popup-btn--ghost:hover:not(:disabled) {
  background: rgba(99,102,241,0.14);
  border-color: rgba(99,102,241,0.4) !important;
  transform: translateY(-2px);
}

/* ── Availability dot ── */
.cal-popup-btn__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px rgba(16,185,129,0.7);
  animation: calDotPulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes calDotPulse {
  0%, 100% { box-shadow: 0 0 6px rgba(16,185,129,0.7); }
  50%       { box-shadow: 0 0 12px rgba(16,185,129,1); }
}

/* ── Spinner ── */
.cal-popup-btn__spinner {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  animation: calSpin 0.7s linear infinite;
  display: inline-block;
}

@keyframes calSpin { to { transform: rotate(360deg); } }

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .cal-popup-btn__dot    { animation: none; }
  .cal-popup-btn__spinner { animation: none; }
}
</style>
