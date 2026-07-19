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
  transition: color 0.2s, transform 0.2s;
}
.theme-switcher:hover {
  color: var(--p-primary-400) !important;
  transform: rotate(15deg);
}
</style>
