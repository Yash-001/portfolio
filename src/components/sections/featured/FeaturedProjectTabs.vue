<template>
  <div ref="tabsEl" class="fp-tabs" role="tablist" :aria-label="ariaLabel">

    <!-- Scrollable pill row -->
    <div ref="trackEl" class="fp-tabs__track">

      <!-- Sliding indicator -->
      <div
        class="fp-tabs__indicator"
        :style="indicatorStyle"
        aria-hidden="true"
      />

      <button
        v-for="tab in EAM_TABS"
        :key="tab.id"
        :ref="el => setTabRef(tab.id, el as HTMLElement)"
        class="fp-tabs__tab"
        :class="{ 'fp-tabs__tab--active': modelValue === tab.id }"
        role="tab"
        :aria-selected="modelValue === tab.id"
        :aria-controls="`panel-${tab.id}`"
        @click="select(tab.id)"
      >
        <i :class="tab.icon" class="fp-tabs__tab-icon" aria-hidden="true" />
        <span>{{ tab.label }}</span>
      </button>

    </div>

    <!-- Fade edges -->
    <div class="fp-tabs__fade fp-tabs__fade--left"  aria-hidden="true" />
    <div class="fp-tabs__fade fp-tabs__fade--right" aria-hidden="true" />

  </div>
</template>

<script setup lang="ts">
import type { EamTabId } from '@/constants/featured-project.constants'
import { EAM_TABS } from '@/constants/featured-project.constants'

const props = defineProps<{ modelValue: EamTabId; ariaLabel?: string }>()
const emit  = defineEmits<{ (e: 'update:modelValue', v: EamTabId): void }>()

const tabsEl  = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)

// Map tab id → button element
const tabRefs = new Map<string, HTMLElement>()
function setTabRef(id: string, el: HTMLElement | null) {
  if (el) tabRefs.set(id, el)
}

// Indicator position
const indicatorLeft  = ref(0)
const indicatorWidth = ref(0)

const indicatorStyle = computed(() => ({
  transform: `translateX(${indicatorLeft.value}px)`,
  width: `${indicatorWidth.value}px`,
}))

function updateIndicator(id: string) {
  const btn   = tabRefs.get(id)
  const track = trackEl.value
  if (!btn || !track) return
  const btnRect   = btn.getBoundingClientRect()
  const trackRect = track.getBoundingClientRect()
  indicatorLeft.value  = btnRect.left - trackRect.left + track.scrollLeft
  indicatorWidth.value = btnRect.width
}

function select(id: EamTabId) {
  emit('update:modelValue', id)
  // Scroll selected tab into view
  nextTick(() => {
    tabRefs.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    updateIndicator(id)
  })
}

// Update indicator on mount and on prop change
onMounted(() => nextTick(() => updateIndicator(props.modelValue)))
watch(() => props.modelValue, (id) => nextTick(() => updateIndicator(id)))

// Recalculate on resize
let ro: ResizeObserver | null = null
onMounted(() => {
  ro = new ResizeObserver(() => updateIndicator(props.modelValue))
  if (trackEl.value) ro.observe(trackEl.value)
})
onUnmounted(() => ro?.disconnect())
</script>

<style scoped>
.fp-tabs {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.fp-tabs__track {
  position: relative;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 4px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(17,17,17,0.8);
  backdrop-filter: blur(12px);
}
.fp-tabs__track::-webkit-scrollbar { display: none; }

/* Sliding indicator */
.fp-tabs__indicator {
  position: absolute;
  top: 4px;
  height: calc(100% - 8px);
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15));
  border: 1px solid rgba(99,102,241,0.3);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              width   0.35s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 0;
}

.fp-tabs__tab {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
  flex-shrink: 0;
  letter-spacing: 0.01em;
}

.fp-tabs__tab:hover { color: #a0a0a0; }

.fp-tabs__tab--active { color: #e5e5e5; font-weight: 600; }

.fp-tabs__tab-icon { font-size: 12px; }

/* Fade edges for scroll hint */
.fp-tabs__fade {
  position: absolute;
  top: 0; bottom: 0;
  width: 48px;
  pointer-events: none;
  z-index: 2;
}
.fp-tabs__fade--left {
  left: 24px;
  background: linear-gradient(to right, #0a0a0a, transparent);
  border-radius: 14px 0 0 14px;
}
.fp-tabs__fade--right {
  right: 24px;
  background: linear-gradient(to left, #0a0a0a, transparent);
  border-radius: 0 14px 14px 0;
}
</style>
