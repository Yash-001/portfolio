<template>
  <Toast position="top-right" :pt="pt" />
</template>

<script setup lang="ts">
import Toast from 'primevue/toast'

const pt = {
  root: { class: 'app-toast' },
  message: { class: 'app-toast__message' },
}
</script>

<style>
.app-toast {
  z-index: 9000 !important;
}
.app-toast__message {
  border-radius: 8px !important;
  border: 1px solid var(--p-surface-700) !important;
  background: var(--p-surface-800) !important;
}
</style>
