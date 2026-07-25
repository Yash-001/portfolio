<template>
  <ServicesSection />
</template>

<script setup lang="ts">
import ServicesSection from '@/components/sections/services/ServicesSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { PAGE_META } from '@/constants'

const meta = PAGE_META['services']
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
