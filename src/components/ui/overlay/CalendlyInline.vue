<template>
  <div
    ref="containerEl"
    class="cal-inline"
    :class="{ 'cal-inline--loading': isLoading, 'cal-inline--error': hasError }"
    :style="{ minHeight: minHeight }"
    aria-label="Schedule a meeting"
    role="region"
  >
    <!-- Loading skeleton -->
    <div
      v-if="isLoading"
      class="cal-inline__skeleton"
      aria-hidden="true"
    >
      <div class="cal-inline__skeleton-bar cal-inline__skeleton-bar--title" />
      <div class="cal-inline__skeleton-bar cal-inline__skeleton-bar--sub" />
      <div class="cal-inline__skeleton-grid">
        <div
          v-for="i in 6"
          :key="i"
          class="cal-inline__skeleton-cell"
        />
      </div>
    </div>

    <!-- Error fallback -->
    <div
      v-if="hasError"
      class="cal-inline__error"
    >
      <i
        class="pi pi-calendar"
        aria-hidden="true"
      />
      <p>Unable to load the scheduler.</p>
      <a
        :href="calendlyUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="cal-inline__error-link"
      >Open Calendly directly →</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCalendly } from '@/composables/useCalendly'
import { CALENDLY_URL } from '@/config/portfolio.config'

interface Props {
  minHeight?: string
}

const { minHeight = '700px' } = defineProps<Props>()

const calendlyUrl  = CALENDLY_URL
const containerEl  = ref<HTMLElement | null>(null)
const { isLoading, hasError, mountInline } = useCalendly()

onMounted(async () => {
  if (containerEl.value) {
    await mountInline(containerEl.value)
  }
})

// Calendly appends an iframe — clean it up on unmount
onUnmounted(() => {
  if (containerEl.value) {
    containerEl.value.innerHTML = ''
  }
})
</script>

<style scoped>
.cal-inline {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: rgba(17,17,17,0.6);
  border: 1px solid rgba(255,255,255,0.06);
}

/* Calendly injects an iframe inside .calendly-inline-widget — force both to fill */
.cal-inline :deep(.calendly-inline-widget) {
  width: 100% !important;
  height: 100% !important;
  min-height: inherit !important;
}

.cal-inline :deep(iframe) {
  width: 100% !important;
  height: 100% !important;
  min-height: inherit !important;
  border: none !important;
  display: block;
}

/* ── Loading skeleton ── */
.cal-inline__skeleton {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cal-inline__skeleton-bar {
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%;
  animation: calShimmer 1.5s infinite;
}

.cal-inline__skeleton-bar--title { height: 20px; width: 55%; }
.cal-inline__skeleton-bar--sub   { height: 14px; width: 35%; }

.cal-inline__skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 8px;
}

.cal-inline__skeleton-cell {
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%;
  animation: calShimmer 1.5s infinite;
}

@keyframes calShimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Error state ── */
.cal-inline__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: #555;
}

.cal-inline__error i { font-size: 32px; color: #333; }
.cal-inline__error p { font-size: 14px; margin: 0; }

.cal-inline__error-link {
  font-size: 13px;
  color: #6366f1;
  text-decoration: none;
  transition: color 0.2s;
}
.cal-inline__error-link:hover { color: #a5b4fc; }

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .cal-inline__skeleton-bar,
  .cal-inline__skeleton-cell { animation: none; }
}
</style>
