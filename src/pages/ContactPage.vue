<template>
  <ContactSection />
</template>

<script setup lang="ts">
import ContactSection from '@/components/sections/contact/ContactSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { PAGE_META } from '@/constants'

const meta = PAGE_META['contact']
usePageMeta({
  title: meta.title,
  meta: [
    { name: 'description', content: meta.description ?? '' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: meta.title ?? '' },
    { property: 'og:description', content: meta.description ?? '' },
  ],
})
</script>
