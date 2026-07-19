<template>
  <div class="skill-filter" role="tablist" aria-label="Filter skills by category">

    <!-- All -->
    <button
      role="tab"
      :aria-selected="modelValue === 'all'"
      class="filter-pill"
      :class="{ 'filter-pill--active': modelValue === 'all' }"
      @click="emit('update:modelValue', 'all')"
    >
      <i class="pi pi-th-large" />
      <span>All</span>
    </button>

    <!-- Per category -->
    <button
      v-for="group in groups"
      :key="group.category"
      role="tab"
      :aria-selected="modelValue === group.category"
      class="filter-pill"
      :class="{ 'filter-pill--active': modelValue === group.category }"
      :style="modelValue === group.category ? activePillStyle(group.category) : {}"
      @click="emit('update:modelValue', group.category)"
    >
      <i :class="group.icon" />
      <span>{{ group.label }}</span>
    </button>

  </div>
</template>

<script setup lang="ts">
import type { SkillGroup, SkillCategory } from '@/types'
import { CATEGORY_COLORS } from '@/constants'

defineProps<{
  groups: SkillGroup[]
  modelValue: SkillCategory | 'all'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SkillCategory | 'all']
}>()

function activePillStyle(category: string) {
  const c = CATEGORY_COLORS[category]
  return {
    background:  `linear-gradient(135deg, ${c.from}22, ${c.to}11)`,
    borderColor: `${c.from}55`,
    color:       c.from,
    boxShadow:   `0 0 16px ${c.glow}`,
  }
}
</script>

<style scoped>
.skill-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 9999px;
  border: 1px solid #222222;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #737373;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s;
  white-space: nowrap;
}

.filter-pill i { font-size: 12px; }

.filter-pill:hover:not(.filter-pill--active) {
  border-color: #333333;
  color: #a0a0a0;
  transform: translateY(-1px);
}

.filter-pill--active {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.4);
  color: #6366f1;
  box-shadow: 0 0 16px rgba(99, 102, 241, 0.15);
}
</style>
