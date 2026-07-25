<template>
  <ServicesSection />
</template>

<script setup lang="ts">
import ServicesSection from '@/components/sections/services/ServicesSection.vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { PAGE_META } from '@/constants'

usePageMeta(PAGE_META['services'])
</script>
