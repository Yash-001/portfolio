<template>
  <div
    id="app-root"
    :class="{ 'reduce-motion': prefersReducedMotion }"
  >
    <AppCursor v-if="!isMobile" />

    <!-- Route navigation loading bar -->
    <Transition name="loading-bar">
      <div
        v-if="isNavigating"
        class="nav-loading-bar"
      />
    </Transition>

    <!-- Global page loading overlay -->
    <Transition name="fade">
      <div
        v-if="ui.isLoading"
        class="global-loading"
        role="status"
        aria-live="polite"
      >
        <ProgressSpinner
          style="width: 40px; height: 40px"
          stroke-width="3"
          animation-duration="0.8s"
        />
        <p
          v-if="ui.loadingText"
          class="global-loading__text"
        >
          {{ ui.loadingText }}
        </p>
      </div>
    </Transition>

    <!-- Layout + pages -->
    <RouterView />

    <AppToast />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import ProgressSpinner from 'primevue/progressspinner'
import AppCursor from '@/components/layout/AppCursor.vue'
import AppToast  from '@/components/layout/AppToast.vue'
import { isNavigating } from '@/router'
import { useUiStore } from '@/stores/ui.store'
import { useLocale } from '@/composables/useLocale'

const ui = useUiStore()
const { initLocale } = useLocale()
const isMobile = useMediaQuery('(max-width: 768px)')
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

onMounted(() => {
  ui.initTheme()
  initLocale()
})
</script>

<style>
/* Page transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1),
              transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Fade utility */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }

/* Nav loading bar */
.nav-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  animation: nav-bar-progress 1.4s ease-in-out infinite;
  transform-origin: left;
}

@keyframes nav-bar-progress {
  0%   { transform: scaleX(0); opacity: 1; }
  70%  { transform: scaleX(0.85); opacity: 1; }
  100% { transform: scaleX(1); opacity: 0; }
}

.loading-bar-enter-active,
.loading-bar-leave-active { transition: opacity 0.2s; }
.loading-bar-enter-from,
.loading-bar-leave-to     { opacity: 0; }

/* Global loading overlay */
.global-loading {
  position: fixed;
  inset: 0;
  z-index: 8000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.global-loading__text {
  font-size: 14px;
  color: #a0a0a0;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.05em;
}

/* Reduce motion */
.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
</style>
