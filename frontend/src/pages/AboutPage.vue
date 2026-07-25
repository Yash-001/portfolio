<template>
  <AboutSection />
</template>

<script setup lang="ts">
import AboutSection from '@/components/sections/about/AboutSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { PAGE_META } from '@/constants'

usePageMeta(PAGE_META['about'])
</script>
