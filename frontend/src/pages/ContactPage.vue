<template>
  <ContactSection />
</template>

<script setup lang="ts">
import ContactSection from '@/components/sections/contact/ContactSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { PAGE_META } from '@/constants'

usePageMeta(PAGE_META['contact'])
</script>
