<template>
  <SkillsSection />
</template>

<script setup lang="ts">
import SkillsSection from '@/components/sections/skills/SkillsSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { PAGE_META } from '@/constants'

usePageMeta(PAGE_META['skills'])
</script>
