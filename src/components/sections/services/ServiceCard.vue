<template>
  <article
    ref="cardEl"
    class="svc-card"
    :class="{
      'svc-card--highlighted': service.highlighted,
      'svc-card--expanded': isExpanded,
    }"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @mouseenter="onMouseEnter"
  >
    <!-- Animated conic border -->
    <div
      class="svc-card__border"
      :style="borderStyle"
      aria-hidden="true"
    />
    <!-- Mouse-follow glow -->
    <div
      class="svc-card__glow"
      :style="glowStyle"
      aria-hidden="true"
    />

    <!-- Highlighted ribbon -->
    <div
      v-if="service.badge"
      class="svc-card__ribbon"
      :style="ribbonStyle"
    >
      {{ service.badge }}
    </div>

    <div class="svc-card__inner">
      <!-- Icon -->
      <div
        class="svc-card__icon-wrap"
        :style="iconWrapStyle"
      >
        <i
          :class="service.icon"
          class="svc-card__icon"
          :style="iconStyle"
        />
      </div>

      <!-- Header -->
      <div class="svc-card__header">
        <h3 class="svc-card__title">
          {{ service.title }}
        </h3>
        <p class="svc-card__tagline">
          {{ service.tagline }}
        </p>
      </div>

      <!-- Description -->
      <p class="svc-card__desc">
        {{ service.description }}
      </p>

      <!-- Meta row -->
      <div class="svc-card__meta">
        <span
          class="svc-card__engagement"
          :style="engagementStyle"
        >
          {{ engagementConfig.label }}
        </span>
        <span
          v-if="service.duration"
          class="svc-card__duration"
        >
          <i
            class="pi pi-clock"
            style="font-size:10px;"
          />
          {{ service.duration }}
        </span>
      </div>

      <!-- Deliverables toggle -->
      <button
        class="svc-card__toggle"
        type="button"
        :aria-expanded="isExpanded"
        @click="isExpanded = !isExpanded"
      >
        <span>{{ isExpanded ? 'Hide' : 'What\'s included' }}</span>
        <i
          class="pi pi-chevron-down"
          style="font-size:10px;"
          :style="{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }"
        />
      </button>

      <!-- Deliverables list -->
      <Transition name="deliverables">
        <ul
          v-if="isExpanded"
          class="svc-card__deliverables"
          role="list"
        >
          <li
            v-for="(d, i) in service.deliverables"
            :key="i"
            class="svc-card__deliverable"
            :style="{ animationDelay: `${i * 50}ms` }"
          >
            <div
              class="svc-card__check"
              :style="checkStyle"
              aria-hidden="true"
            >
              <i
                class="pi pi-check"
                style="font-size:8px;"
              />
            </div>
            <span>{{ d.text }}</span>
          </li>
        </ul>
      </Transition>

      <!-- CTA -->
      <a
        href="/#contact"
        class="svc-card__cta"
        :style="ctaStyle"
        :aria-label="`Enquire about ${service.title}`"
      >
        <span>Enquire</span>
        <i
          class="pi pi-arrow-right"
          style="font-size:11px;"
        />
      </a>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Service } from '@/types'
import { SERVICE_ENGAGEMENT_CONFIG, SERVICE_GRADIENTS } from '@/constants/services.constants'

const props = defineProps<{ service: Service; index: number }>()

const gradient        = computed(() => SERVICE_GRADIENTS[props.index % 9])
const engagementConfig = computed(() => SERVICE_ENGAGEMENT_CONFIG[props.service.engagement])

const isExpanded = ref(false)

// ── 3D tilt ───────────────────────────────────────────────────────
const cardEl    = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const mouseX    = ref(50)
const mouseY    = ref(50)

function onMouseEnter() { isHovered.value = true }
function onMouseLeave() {
  isHovered.value = false
  mouseX.value = 50; mouseY.value = 50
}
function onMouseMove(e: MouseEvent) {
  const el = cardEl.value
  if (!el) return
  const { left, top, width, height } = el.getBoundingClientRect()
  mouseX.value = ((e.clientX - left) / width)  * 100
  mouseY.value = ((e.clientY - top)  / height) * 100
}

// ── Computed styles ───────────────────────────────────────────────
const borderStyle = computed(() => ({
  background: isHovered.value
    ? `conic-gradient(from ${mouseX.value * 3.6}deg at ${mouseX.value}% ${mouseY.value}%, ${gradient.value.from}, ${gradient.value.to}, transparent 45%)`
    : `linear-gradient(135deg, ${gradient.value.from}33, transparent 60%)`,
  opacity: isHovered.value ? 1 : (props.service.highlighted ? 0.6 : 0.3),
  transition: 'opacity 0.3s',
}))

const glowStyle = computed(() => ({
  background: `radial-gradient(circle at ${mouseX.value}% ${mouseY.value}%, ${gradient.value.glow} 0%, transparent 55%)`,
  opacity: isHovered.value ? 1 : 0,
  transition: 'opacity 0.4s',
}))

const iconWrapStyle = computed(() => ({
  background: `linear-gradient(135deg, ${gradient.value.from}18, ${gradient.value.to}0d)`,
  border: `1px solid ${gradient.value.from}33`,
  boxShadow: isHovered.value ? `0 0 24px ${gradient.value.glow}` : 'none',
  transition: 'box-shadow 0.3s',
}))

const iconStyle = computed(() => ({
  background: `linear-gradient(135deg, ${gradient.value.from}, ${gradient.value.to})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}))

const ribbonStyle = computed(() => ({
  background: `linear-gradient(135deg, ${gradient.value.from}, ${gradient.value.to})`,
}))

const engagementStyle = computed(() => ({
  color: engagementConfig.value.color,
  background: engagementConfig.value.bg,
}))

const checkStyle = computed(() => ({
  background: `${gradient.value.from}22`,
  border: `1px solid ${gradient.value.from}44`,
  color: gradient.value.from,
}))

const ctaStyle = computed(() => ({
  '--cta-from': gradient.value.from,
  '--cta-to':   gradient.value.to,
  '--cta-glow': gradient.value.glow,
}))
</script>

<style scoped>
/* ── Card shell ────────────────────────────────────────────────── */
.svc-card {
  position: relative;
  border-radius: 20px;
  isolation: isolate;
  will-change: transform;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  height: 100%;
}
.svc-card:hover { transform: translateY(-4px); }

.svc-card__border {
  position: absolute; inset: -1px; border-radius: 21px;
  pointer-events: none; z-index: 0;
}
.svc-card__glow {
  position: absolute; inset: 0; border-radius: 20px;
  pointer-events: none; z-index: 0;
}

/* ── Inner ─────────────────────────────────────────────────────── */
.svc-card__inner {
  position: relative; z-index: 1;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(17,17,17,0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 28px;
  display: flex; flex-direction: column; gap: 18px;
  height: 100%; box-sizing: border-box;
}

.svc-card--highlighted .svc-card__inner {
  border-color: rgba(99,102,241,0.2);
  background: rgba(17,17,17,0.97);
}

/* ── Ribbon ────────────────────────────────────────────────────── */
.svc-card__ribbon {
  position: absolute; top: 16px; right: -1px; z-index: 2;
  font-size: 9px; font-weight: 700; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.1em; text-transform: uppercase; color: #fff;
  padding: 4px 12px 4px 10px; border-radius: 4px 0 0 4px;
}

/* ── Icon ──────────────────────────────────────────────────────── */
.svc-card__icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.svc-card__icon { font-size: 22px; }

/* ── Header ────────────────────────────────────────────────────── */
.svc-card__title {
  font-size: 18px; font-weight: 700; color: #f5f5f5;
  letter-spacing: -0.025em; line-height: 1.2; margin-bottom: 6px;
}
.svc-card__tagline {
  font-size: 13px; font-weight: 500; color: #737373; line-height: 1.5;
}

/* ── Description ───────────────────────────────────────────────── */
.svc-card__desc { font-size: 13.5px; line-height: 1.75; color: #737373; }

/* ── Meta ──────────────────────────────────────────────────────── */
.svc-card__meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.svc-card__engagement {
  font-size: 10px; font-weight: 700; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 3px 10px; border-radius: 5px;
}
.svc-card__duration {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-family: 'Geist Mono', monospace; color: #555;
}

/* ── Toggle ────────────────────────────────────────────────────── */
.svc-card__toggle {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-radius: 10px;
  border: 1px solid #1a1a1a; background: rgba(255,255,255,0.02);
  font-size: 12px; font-weight: 500; color: #737373;
  cursor: pointer; transition: border-color 0.2s, color 0.2s, background 0.2s;
  width: 100%;
}
.svc-card__toggle:hover {
  border-color: rgba(99,102,241,0.25); color: #a0a0a0;
  background: rgba(99,102,241,0.04);
}

/* ── Deliverables ──────────────────────────────────────────────── */
.svc-card__deliverables {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 10px;
}
.svc-card__deliverable {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 13px; color: #a0a0a0; line-height: 1.5;
  opacity: 0; transform: translateY(8px);
  animation: deliverIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
}
@keyframes deliverIn { to { opacity: 1; transform: translateY(0); } }

.svc-card__check {
  width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; margin-top: 1px;
}

/* ── CTA ───────────────────────────────────────────────────────── */
.svc-card__cta {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px 20px; border-radius: 10px; margin-top: auto;
  font-size: 13px; font-weight: 600; text-decoration: none; letter-spacing: 0.02em;
  background: linear-gradient(135deg, var(--cta-from), var(--cta-to));
  color: #fff; border: none;
  box-shadow: 0 4px 16px var(--cta-glow);
  transition: box-shadow 0.3s, transform 0.2s;
}
.svc-card__cta:hover {
  box-shadow: 0 8px 28px var(--cta-glow);
  transform: translateY(-1px);
}

/* ── Transition: deliverables ──────────────────────────────────── */
.deliverables-enter-active {
  transition: max-height 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease;
  max-height: 400px;
}
.deliverables-leave-active {
  transition: max-height 0.3s cubic-bezier(0.76,0,0.24,1), opacity 0.2s ease;
  max-height: 400px;
  overflow: hidden;
}
.deliverables-enter-from,
.deliverables-leave-to { max-height: 0; opacity: 0; overflow: hidden; }
</style>
