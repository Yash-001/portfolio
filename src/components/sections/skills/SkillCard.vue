<template>
  <article
    ref="cardEl"
    class="skill-card"
    :style="cardStyle"
    :aria-label="`${group.label} skills`"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @mouseenter="onMouseEnter"
  >
    <!-- Animated conic border -->
    <div
      class="skill-card__border"
      :style="borderStyle"
      aria-hidden="true"
    />

    <!-- Glow blob -->
    <div
      class="skill-card__glow"
      :style="glowStyle"
      aria-hidden="true"
    />

    <!-- Inner content -->
    <div class="skill-card__inner">
      <!-- Header -->
      <div class="skill-card__header">
        <div
          class="skill-card__icon-wrap"
          :style="iconWrapStyle"
        >
          <i
            :class="group.icon"
            class="skill-card__icon"
            :style="{ color: colors.from }"
          />
        </div>
        <div class="skill-card__meta">
          <h3 class="skill-card__title">
            {{ group.label }}
          </h3>
          <span class="skill-card__count">{{ group.skills.length }} skill{{ group.skills.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Description -->
      <p class="skill-card__desc">
        {{ group.description }}
      </p>

      <!-- Divider -->
      <div
        class="skill-card__divider"
        :style="{ background: `linear-gradient(90deg, ${colors.from}44, transparent)` }"
      />

      <!-- Skills list -->
      <ul
        class="skill-card__skills"
        role="list"
      >
        <li
          v-for="skill in group.skills"
          :key="skill.id"
          class="skill-item"
        >
          <div class="skill-item__top">
            <span class="skill-item__name">{{ skill.name }}</span>
            <span
              class="skill-item__level"
              :style="{
                color: SKILL_LEVEL_CONFIG[skill.level].color,
                background: SKILL_LEVEL_CONFIG[skill.level].bg,
              }"
            >
              {{ SKILL_LEVEL_CONFIG[skill.level].label }}
            </span>
          </div>
          <p
            v-if="skill.context"
            class="skill-item__context"
          >
            {{ skill.context }}
          </p>
          <div
            class="skill-item__bar-track"
            aria-hidden="true"
          >
            <div
              class="skill-item__bar-fill"
              :style="{
                width: showBars ? LEVEL_WIDTH[skill.level] : '0%',
                background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
                transitionDelay: `${group.skills.indexOf(skill) * 60}ms`,
              }"
            />
          </div>
        </li>
      </ul>

      <!-- Years badge -->
      <div class="skill-card__footer">
        <span
          class="skill-card__years"
          :style="{ color: colors.from }"
        >
          <i
            class="pi pi-clock"
            style="font-size: 11px;"
          />
          {{ maxYears }}+ yrs
        </span>
        <div
          class="skill-card__dots"
          aria-hidden="true"
        >
          <span
            v-for="n in 3"
            :key="n"
            class="dot"
            :style="{ background: n === 1 ? colors.from : undefined }"
          />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { SkillGroup } from '@/types'
import { SKILL_LEVEL_CONFIG, CATEGORY_COLORS } from '@/constants'

const props = defineProps<{ group: SkillGroup }>()

const LEVEL_WIDTH: Record<string, string> = {
  expert:       '95%',
  advanced:     '78%',
  intermediate: '58%',
  learning:     '35%',
}

const colors  = computed(() => CATEGORY_COLORS[props.group.category])
const maxYears = computed(() => Math.max(...props.group.skills.map((s) => s.yearsOfExperience)))

// ── 3D tilt ──────────────────────────────────────────────────────
const cardEl    = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const showBars  = ref(false) // delayed reset prevents bar flicker on quick mouseleave
const tiltX     = ref(0)
const tiltY     = ref(0)
const mouseX    = ref(50)
const mouseY    = ref(50)

let barTimer: ReturnType<typeof setTimeout> | null = null

function onMouseEnter() {
  isHovered.value = true
  if (barTimer) { clearTimeout(barTimer); barTimer = null }
  showBars.value = true
}

function onMouseMove(e: MouseEvent) {
  const el = cardEl.value
  if (!el) return
  const { left, top, width, height } = el.getBoundingClientRect()
  const x = (e.clientX - left) / width
  const y = (e.clientY - top)  / height
  tiltX.value  = (y - 0.5) * -12
  tiltY.value  = (x - 0.5) *  12
  mouseX.value = x * 100
  mouseY.value = y * 100
}

function onMouseLeave() {
  isHovered.value = false
  tiltX.value = 0
  tiltY.value = 0
  mouseX.value = 50
  mouseY.value = 50
  // Keep bars visible until CSS transition finishes (800ms + buffer)
  barTimer = setTimeout(() => { showBars.value = false }, 900)
}

onUnmounted(() => { if (barTimer) clearTimeout(barTimer) })

// ── Computed styles ───────────────────────────────────────────────
const cardStyle = computed(() => ({
  transform: isHovered.value
    ? `perspective(800px) rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg) translateZ(8px)`
    : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
  transition: isHovered.value
    ? 'transform 0.1s ease-out'
    : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
}))

const borderStyle = computed(() => ({
  background: isHovered.value
    ? `conic-gradient(from ${mouseX.value * 3.6}deg at ${mouseX.value}% ${mouseY.value}%, ${colors.value.from}, ${colors.value.to}, transparent 40%)`
    : `conic-gradient(from 0deg, ${colors.value.from}22, transparent 60%)`,
  opacity: isHovered.value ? 1 : 0.4,
  transition: 'opacity 0.3s',
}))

const glowStyle = computed(() => ({
  background: `radial-gradient(circle at ${mouseX.value}% ${mouseY.value}%, ${colors.value.glow} 0%, transparent 60%)`,
  opacity: isHovered.value ? 1 : 0,
  transition: 'opacity 0.4s',
}))

const iconWrapStyle = computed(() => ({
  background: `linear-gradient(135deg, ${colors.value.from}22, ${colors.value.to}11)`,
  border: `1px solid ${colors.value.from}33`,
  boxShadow: isHovered.value ? `0 0 20px ${colors.value.glow}` : 'none',
  transition: 'box-shadow 0.3s',
}))
</script>

<style scoped>
.skill-card {
  position: relative;
  border-radius: 20px;
  cursor: default;
  will-change: transform;
  isolation: isolate;
}

/* ── Animated conic border ─────────────────────────────────────── */
.skill-card__border {
  position: absolute;
  inset: -1px;
  border-radius: 21px;
  z-index: 0;
  pointer-events: none;
}

/* ── Glow ──────────────────────────────────────────────────────── */
.skill-card__glow {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  z-index: 0;
  pointer-events: none;
}

/* ── Inner ─────────────────────────────────────────────────────── */
.skill-card__inner {
  position: relative;
  z-index: 1;
  padding: 28px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(17, 17, 17, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

/* ── Header ────────────────────────────────────────────────────── */
.skill-card__header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.skill-card__icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.skill-card__icon { font-size: 20px; }

.skill-card__meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.skill-card__title {
  font-size: 16px;
  font-weight: 700;
  color: #f5f5f5;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.skill-card__count {
  font-size: 11px;
  font-family: 'Geist Mono', monospace;
  color: #555555;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ── Description ───────────────────────────────────────────────── */
.skill-card__desc {
  font-size: 13px;
  line-height: 1.7;
  color: #737373;
}

/* ── Divider ───────────────────────────────────────────────────── */
.skill-card__divider {
  height: 1px;
  border-radius: 1px;
}

/* ── Skills list ───────────────────────────────────────────────── */
.skill-card__skills {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.skill-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.skill-item__name {
  font-size: 13px;
  font-weight: 600;
  color: #e5e5e5;
  letter-spacing: -0.01em;
}

.skill-item__level {
  font-size: 10px;
  font-weight: 600;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.skill-item__context {
  font-size: 11.5px;
  line-height: 1.6;
  color: #555555;
}

/* Thin accent bar — replaces boring progress bar */
.skill-item__bar-track {
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.skill-item__bar-fill {
  height: 100%;
  border-radius: 2px;
  width: 0%;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Footer ────────────────────────────────────────────────────── */
.skill-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
}

.skill-card__years {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-family: 'Geist Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.skill-card__dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #2a2a2a;
}
</style>
