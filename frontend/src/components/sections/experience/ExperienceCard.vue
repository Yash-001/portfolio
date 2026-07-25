<template>
  <article
    ref="cardEl"
    class="exp-card"
    :class="{ 'exp-card--current': experience.current, 'exp-card--expanded': isExpanded }"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @mouseenter="onMouseEnter"
  >
    <!-- Animated border layer -->
    <div
      class="exp-card__border"
      :style="borderStyle"
      aria-hidden="true"
    />

    <!-- Mouse-follow glow -->
    <div
      class="exp-card__glow"
      :style="glowStyle"
      aria-hidden="true"
    />

    <!-- Card body -->
    <div class="exp-card__body">
      <!-- ── Header ─────────────────────────────────────────── -->
      <header class="exp-card__header">
        <div class="exp-card__header-left">
          <!-- Company initial badge -->
          <div
            class="exp-card__badge"
            :style="badgeStyle"
          >
            {{ experience.company.charAt(0) }}
          </div>

          <div class="exp-card__title-block">
            <div class="exp-card__role-row">
              <h3 class="exp-card__role">
                {{ experience.role }}
              </h3>
              <span
                v-if="experience.current"
                class="exp-card__current-tag"
              >Current</span>
            </div>
            <div class="exp-card__company-row">
              <span class="exp-card__company">{{ experience.company }}</span>
              <span
                class="exp-card__sep"
                aria-hidden="true"
              >·</span>
              <span class="exp-card__location">
                <i
                  class="pi pi-map-marker"
                  style="font-size:10px;"
                />
                {{ experience.location }}
              </span>
            </div>
          </div>
        </div>

        <div class="exp-card__header-right">
          <div class="exp-card__duration-block">
            <span class="exp-card__dates">{{ formattedDates }}</span>
            <span class="exp-card__tenure">{{ tenure }}</span>
          </div>
          <span
            class="exp-card__type-badge"
            :style="{ color: typeConfig.color, background: typeConfig.bg }"
          >{{ typeConfig.label }}</span>
        </div>
      </header>

      <!-- ── Description ────────────────────────────────────── -->
      <p class="exp-card__desc">
        {{ experience.description }}
      </p>

      <!-- ── Tech chips ─────────────────────────────────────── -->
      <div
        class="exp-card__tech"
        aria-label="Technologies used"
      >
        <span
          v-for="t in experience.tech"
          :key="t.name"
          class="tech-chip"
        >{{ t.name }}</span>
      </div>

      <!-- ── Expandable achievements ────────────────────────── -->
      <button
        class="exp-card__expand-trigger"
        :aria-expanded="isExpanded"
        :aria-controls="`exp-achievements-${experience.id}`"
        @click="toggleExpand"
      >
        <span class="expand-label">
          {{ isExpanded ? 'Hide' : 'Show' }} achievements
          <span class="expand-count">({{ experience.highlights.length }})</span>
        </span>
        <div
          class="expand-icon"
          :class="{ 'expand-icon--open': isExpanded }"
          aria-hidden="true"
        >
          <i class="pi pi-chevron-down" />
        </div>
      </button>

      <!-- Achievements — animated expand -->
      <Transition name="achievements">
        <div
          v-if="isExpanded"
          :id="`exp-achievements-${experience.id}`"
          class="exp-card__achievements"
        >
          <ul
            class="achievements-list"
            role="list"
          >
            <li
              v-for="(highlight, i) in experience.highlights"
              :key="i"
              class="achievement-item"
              :style="{ transitionDelay: `${i * 50}ms` }"
            >
              <div
                class="achievement-bullet"
                aria-hidden="true"
              >
                <div class="achievement-bullet__inner" />
              </div>
              <span class="achievement-text">{{ highlight.text }}</span>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Experience } from '@/types'
import { EXPERIENCE_TYPE_CONFIG } from '@/constants'

const props = defineProps<{ experience: Experience }>()

// ── Expand state ──────────────────────────────────────────────────
const isExpanded = ref(false)
function toggleExpand() { isExpanded.value = !isExpanded.value }

// ── Date formatting ───────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
    month: 'short', year: 'numeric',
  })
}

const formattedDates = computed(() => {
  const start = formatDate(props.experience.startDate)
  const end   = props.experience.endDate === 'present'
    ? 'Present'
    : formatDate(props.experience.endDate)
  return `${start} — ${end}`
})

const tenure = computed(() => {
  const start   = new Date(props.experience.startDate)
  const end     = props.experience.endDate === 'present' ? new Date() : new Date(props.experience.endDate)
  const months  = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  const years   = Math.floor(months / 12)
  const rem     = months % 12
  if (years === 0) return `${rem}mo`
  if (rem  === 0) return `${years}yr`
  return `${years}yr ${rem}mo`
})

const typeConfig = computed(() => EXPERIENCE_TYPE_CONFIG[props.experience.type])

// ── 3D tilt + glow ────────────────────────────────────────────────
const cardEl   = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const mouseX   = ref(50)
const mouseY   = ref(50)
const tiltX    = ref(0)
const tiltY    = ref(0)

function onMouseEnter() { isHovered.value = true }

function onMouseMove(e: MouseEvent) {
  const el = cardEl.value
  if (!el) return
  const { left, top, width, height } = el.getBoundingClientRect()
  const x = (e.clientX - left) / width
  const y = (e.clientY - top)  / height
  tiltX.value  = (y - 0.5) * -6
  tiltY.value  = (x - 0.5) *  6
  mouseX.value = x * 100
  mouseY.value = y * 100
}

function onMouseLeave() {
  isHovered.value = false
  tiltX.value = 0; tiltY.value = 0
  mouseX.value = 50; mouseY.value = 50
}

// ── Computed styles ───────────────────────────────────────────────
const accentColor = computed(() =>
  props.experience.current ? '#6366f1' : '#333333',
)

const badgeStyle = computed(() => ({
  background: props.experience.current
    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    : 'linear-gradient(135deg, #1a1a1a, #222222)',
  color: props.experience.current ? '#fff' : '#737373',
  boxShadow: props.experience.current && isHovered.value
    ? '0 0 24px rgba(99,102,241,0.4)'
    : 'none',
  transition: 'box-shadow 0.3s',
}))

const borderStyle = computed(() => ({
  background: isHovered.value
    ? `conic-gradient(from ${mouseX.value * 3.6}deg at ${mouseX.value}% ${mouseY.value}%, ${accentColor.value}, transparent 50%)`
    : `linear-gradient(135deg, ${accentColor.value}44, transparent)`,
  opacity: isHovered.value ? 0.9 : 0.3,
  transition: 'opacity 0.3s',
}))

const glowStyle = computed(() => ({
  background: `radial-gradient(circle at ${mouseX.value}% ${mouseY.value}%, rgba(99,102,241,0.08) 0%, transparent 60%)`,
  opacity: isHovered.value ? 1 : 0,
  transition: 'opacity 0.4s',
}))
</script>

<style scoped>
/* ── Card shell ────────────────────────────────────────────────── */
.exp-card {
  position: relative;
  border-radius: 20px;
  will-change: transform;
  isolation: isolate;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.exp-card:hover {
  transform: translateY(-3px);
}

/* ── Animated border ───────────────────────────────────────────── */
.exp-card__border {
  position: absolute;
  inset: -1px;
  border-radius: 21px;
  pointer-events: none;
  z-index: 0;
}

/* ── Glow ──────────────────────────────────────────────────────── */
.exp-card__glow {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  pointer-events: none;
  z-index: 0;
}

/* ── Body ──────────────────────────────────────────────────────── */
.exp-card__body {
  position: relative;
  z-index: 1;
  padding: 28px 32px;
  border-radius: 20px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.exp-card--current .exp-card__body {
  border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
  background: var(--bg-primary);
}

/* ── Header ────────────────────────────────────────────────────── */
.exp-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.exp-card__header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.exp-card__badge {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
  letter-spacing: -0.02em;
}

.exp-card__title-block {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.exp-card__role-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.exp-card__role {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.exp-card__current-tag {
  font-size: 10px;
  font-weight: 700;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
  background: var(--color-primary-muted);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  padding: 2px 8px;
  border-radius: 4px;
}

.exp-card__company-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.exp-card__company {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.exp-card__sep { color: var(--border-active); font-size: 12px; }

.exp-card__location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: 'Geist Mono', monospace;
}

.exp-card__header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.exp-card__duration-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.exp-card__dates {
  font-size: 12px;
  font-family: 'Geist Mono', monospace;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.exp-card__tenure {
  font-size: 11px;
  font-family: 'Geist Mono', monospace;
  color: var(--text-disabled);
  letter-spacing: 0.04em;
}

.exp-card__type-badge {
  font-size: 10px;
  font-weight: 600;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 4px;
}

/* ── Description ───────────────────────────────────────────────── */
.exp-card__desc {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-tertiary);
  max-width: 80ch;
}

/* ── Tech chips ────────────────────────────────────────────────── */
.exp-card__tech {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-chip {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  font-family: 'Geist Mono', monospace;
  color: var(--text-tertiary);
  border: 1px solid var(--border-default);
  background: var(--bg-primary);
  transition: border-color 0.2s, color 0.2s;
  letter-spacing: 0.02em;
}

.exp-card:hover .tech-chip {
  border-color: color-mix(in srgb, var(--color-primary) 20%, transparent);
  color: var(--text-secondary);
}

/* ── Expand trigger ────────────────────────────────────────────── */
.exp-card__expand-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-primary);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  user-select: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.exp-card__expand-trigger:hover {
  border-color: color-mix(in srgb, var(--color-primary) 25%, transparent);
  background: color-mix(in srgb, var(--color-primary) 4%, var(--bg-primary));
}

.exp-card__expand-trigger:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.expand-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary);
  transition: color 0.2s;
}

.exp-card__expand-trigger:hover .expand-label { color: var(--text-secondary); }

.expand-count {
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  color: var(--text-disabled);
  margin-left: 4px;
}

.expand-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-disabled);
  font-size: 10px;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s, color 0.2s;
}

.expand-icon--open {
  transform: rotate(180deg);
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
  color: var(--color-primary);
}

/* ── Achievements ──────────────────────────────────────────────── */
.exp-card__achievements {
  overflow: hidden;
}

.achievements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
}

.achievement-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  opacity: 0;
  transform: translateY(8px);
  animation: achieveIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes achieveIn {
  to { opacity: 1; transform: translateY(0); }
}

.achievement-bullet {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  background: var(--color-primary-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.achievement-bullet__inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}

.achievement-text {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* ── Transition: achievements expand ───────────────────────────── */
.achievements-enter-active {
  transition: max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.3s ease;
  max-height: 800px;
  overflow: hidden;
}
.achievements-leave-active {
  transition: max-height 0.35s cubic-bezier(0.76, 0, 0.24, 1),
              opacity 0.2s ease;
  max-height: 800px;
  overflow: hidden;
}
.achievements-enter-from,
.achievements-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
