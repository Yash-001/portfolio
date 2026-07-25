<template>
  <TestimonialsSection />
</template>

<script setup lang="ts">
import TestimonialsSection from '@/components/sections/testimonials/TestimonialsSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { PAGE_META } from '@/constants'

usePageMeta(PAGE_META['testimonials'])
</script>
