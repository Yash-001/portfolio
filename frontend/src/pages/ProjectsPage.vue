<template>
  <ProjectsSection />
</template>

<script setup lang="ts">
import ProjectsSection from '@/components/sections/projects/ProjectsSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { PAGE_META } from '@/constants'

usePageMeta(PAGE_META['projects'])
</script>
