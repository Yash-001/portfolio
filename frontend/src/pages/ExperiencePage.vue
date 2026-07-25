<template>
  <ExperienceSection />
</template>

<script setup lang="ts">
import ExperienceSection from '@/components/sections/experience/ExperienceSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { PAGE_META } from '@/constants'

usePageMeta(PAGE_META['experience'])
</script>
