<template>
  <Button
    :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    text
    rounded
    class="theme-switcher"
    @click="toggleTheme"
  />
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { useTheme } from '@/composables/useTheme'
const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-switcher {
  color: var(--p-surface-300) !important;
  transition: color 0.2s !important;
}
.theme-switcher:hover {
  color: var(--p-primary-400) !important;
}
.theme-switcher :deep(.p-button-icon) {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
  transform-origin: center center !important;
  display: inline-block !important;
}
.theme-switcher:hover :deep(.p-button-icon) {
  transform: rotate(30deg) !important;
}
</style>
