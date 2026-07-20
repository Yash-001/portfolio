<template>
  <div class="projects-filter">
    <!-- Search -->
    <div class="projects-filter__search">
      <i class="pi pi-search search-icon" />
      <input
        :value="search"
        type="text"
        placeholder="Search projects..."
        class="search-input"
        aria-label="Search projects"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="search"
        class="search-clear"
        aria-label="Clear search"
        @click="emit('update:search', '')"
      >
        <i
          class="pi pi-times"
          style="font-size:10px;"
        />
      </button>
    </div>

    <!-- Category pills -->
    <div
      class="projects-filter__pills"
      role="tablist"
      aria-label="Filter by category"
    >
      <button
        role="tab"
        :aria-selected="category === 'all'"
        class="filter-pill"
        :class="{ 'filter-pill--active': category === 'all' }"
        @click="emit('update:category', 'all')"
      >
        <i class="pi pi-th-large" />
        All
      </button>
      <button
        v-for="(cfg, key) in PROJECT_CATEGORY_CONFIG"
        :key="key"
        role="tab"
        :aria-selected="category === key"
        class="filter-pill"
        :class="{ 'filter-pill--active': category === key }"
        :style="category === key ? {
          background: cfg.bg,
          borderColor: cfg.color + '55',
          color: cfg.color,
          boxShadow: `0 0 16px ${cfg.bg}`,
        } : {}"
        @click="emit('update:category', key as ProjectCategory)"
      >
        <i :class="cfg.icon" />
        {{ cfg.label }}
      </button>
    </div>

    <!-- Result count -->
    <div class="projects-filter__count">
      <span class="count-value">{{ count }}</span>
      <span class="count-label">project{{ count !== 1 ? 's' : '' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectCategory } from '@/types'
import { PROJECT_CATEGORY_CONFIG } from '@/constants'

defineProps<{
  search:   string
  category: ProjectCategory | 'all'
  count:    number
}>()

const emit = defineEmits<{
  'update:search':   [value: string]
  'update:category': [value: ProjectCategory | 'all']
}>()
</script>

<style scoped>
.projects-filter {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

/* Search */
.projects-filter__search {
  position: relative;
  width: 100%;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: #555555;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 11px 40px 11px 40px;
  border-radius: 10px;
  border: 1px solid #222222;
  background: rgba(255, 255, 255, 0.03);
  color: #f5f5f5;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input::placeholder { color: #555555; }

.search-input:focus {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #333333;
  background: #1a1a1a;
  color: #737373;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.search-clear:hover { background: #222222; color: #f5f5f5; }

/* Pills */
.projects-filter__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 9999px;
  border: 1px solid #222222;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: #737373;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-pill i { font-size: 11px; }

.filter-pill:hover:not(.filter-pill--active) {
  border-color: #333333;
  color: #a0a0a0;
  transform: translateY(-1px);
}

.filter-pill--active {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.35);
  color: #6366f1;
}

/* Count */
.projects-filter__count {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.count-value {
  font-size: 20px;
  font-weight: 700;
  color: #f5f5f5;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.count-label {
  font-size: 12px;
  color: #555555;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.04em;
}
</style>
