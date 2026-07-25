<template>
  <BlogSection />
</template>

<script setup lang="ts">
import BlogSection from '@/components/sections/blog/BlogSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { PAGE_META } from '@/constants'

usePageMeta(PAGE_META['blog'])
</script>
