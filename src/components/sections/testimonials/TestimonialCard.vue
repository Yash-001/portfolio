<template>
  <article
    ref="cardEl"
    class="tcard"
    :class="{ 'tcard--featured': testimonial.featured }"
    :aria-label="`Testimonial from ${testimonial.author}`"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @mouseenter="onMouseEnter"
  >
    <!-- Conic border -->
    <div
      class="tcard__border"
      :style="borderStyle"
      aria-hidden="true"
    />
    <!-- Glow -->
    <div
      class="tcard__glow"
      :style="glowStyle"
      aria-hidden="true"
    />

    <div class="tcard__inner">
      <!-- Top row: rating + project ref -->
      <div class="tcard__top">
        <div
          class="tcard__stars"
          :aria-label="`${testimonial.rating} out of 5 stars`"
        >
          <i
            v-for="n in 5"
            :key="n"
            class="pi pi-star-fill tcard__star"
            :class="{ 'tcard__star--lit': n <= testimonial.rating }"
          />
        </div>
        <span
          v-if="testimonial.projectRef"
          class="tcard__project-ref"
        >
          {{ testimonial.projectRef }}
        </span>
      </div>

      <!-- Quote -->
      <blockquote class="tcard__quote">
        <span
          class="tcard__quote-mark"
          aria-hidden="true"
        >"</span>
        {{ testimonial.quote }}
      </blockquote>

      <!-- Divider -->
      <div
        class="tcard__divider"
        :style="dividerStyle"
      />

      <!-- Author row -->
      <div class="tcard__author">
        <!-- Avatar placeholder -->
        <div
          class="tcard__avatar"
          :style="avatarStyle"
        >
          <img
            v-if="testimonial.avatar"
            :src="testimonial.avatar"
            :alt="testimonial.author"
            class="tcard__avatar-img"
          />
          <span
            v-else
            class="tcard__avatar-initials"
          >
            {{ initials }}
          </span>
        </div>

        <!-- Author info -->
        <div class="tcard__author-info">
          <div class="tcard__author-name">
            {{ testimonial.author }}
          </div>
          <div class="tcard__author-role">
            {{ testimonial.role }}
            <span
              class="tcard__author-sep"
              aria-hidden="true"
            >·</span>
            {{ testimonial.company }}
          </div>
          <div
            v-if="testimonial.location"
            class="tcard__author-location"
          >
            <i
              class="pi pi-map-marker"
              style="font-size:9px;"
            />
            {{ testimonial.location }}
          </div>
        </div>

        <!-- Company logo placeholder -->
        <div
          class="tcard__logo-wrap"
          :title="testimonial.company"
        >
          <img
            v-if="testimonial.companyLogo"
            :src="testimonial.companyLogo"
            :alt="testimonial.company"
            class="tcard__logo"
          />
          <div
            v-else
            class="tcard__logo-placeholder"
            :style="logoPlaceholderStyle"
          >
            {{ testimonial.company.charAt(0) }}
          </div>
        </div>
      </div>

      <!-- Engagement badge -->
      <div
        v-if="testimonial.engagement"
        class="tcard__engagement"
      >
        <i
          class="pi pi-briefcase"
          style="font-size:9px;"
        />
        {{ testimonial.engagement }}
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TestimonialFull } from '@/constants/testimonials.constants'

const props = defineProps<{ testimonial: TestimonialFull; colorIndex?: number }>()

// Per-card accent colors cycling through the palette
const ACCENTS = [
  { from: '#6366f1', to: '#8b5cf6', glow: 'rgba(99,102,241,0.2)'  },
  { from: '#10b981', to: '#06b6d4', glow: 'rgba(16,185,129,0.2)'  },
  { from: '#8b5cf6', to: '#ec4899', glow: 'rgba(139,92,246,0.2)'  },
  { from: '#f59e0b', to: '#ef4444', glow: 'rgba(245,158,11,0.2)'  },
  { from: '#06b6d4', to: '#6366f1', glow: 'rgba(6,182,212,0.2)'   },
]

const accent = computed(() => ACCENTS[(props.colorIndex ?? 0) % ACCENTS.length])

const initials = computed(() => {
  const parts = props.testimonial.author.split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : parts[0][0]
})

// ── 3D tilt ───────────────────────────────────────────────────────
const cardEl    = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const mouseX    = ref(50)
const mouseY    = ref(50)

function onMouseEnter() { isHovered.value = true }
function onMouseLeave() { isHovered.value = false; mouseX.value = 50; mouseY.value = 50 }
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
    ? `conic-gradient(from ${mouseX.value * 3.6}deg at ${mouseX.value}% ${mouseY.value}%, ${accent.value.from}, ${accent.value.to}, transparent 45%)`
    : `linear-gradient(135deg, ${accent.value.from}33, transparent 60%)`,
  opacity: isHovered.value ? 1 : (props.testimonial.featured ? 0.55 : 0.25),
  transition: 'opacity 0.3s',
}))

const glowStyle = computed(() => ({
  background: `radial-gradient(circle at ${mouseX.value}% ${mouseY.value}%, ${accent.value.glow} 0%, transparent 55%)`,
  opacity: isHovered.value ? 1 : 0,
  transition: 'opacity 0.4s',
}))

const dividerStyle = computed(() => ({
  background: `linear-gradient(90deg, ${accent.value.from}55, transparent)`,
}))

const avatarStyle = computed(() => ({
  background: `linear-gradient(135deg, ${accent.value.from}33, ${accent.value.to}22)`,
  border: `1px solid ${accent.value.from}44`,
}))

const logoPlaceholderStyle = computed(() => ({
  background: `linear-gradient(135deg, ${accent.value.from}22, ${accent.value.to}11)`,
  border: `1px solid ${accent.value.from}33`,
  color: accent.value.from,
}))
</script>

<style scoped>
/* ── Card shell ────────────────────────────────────────────────── */
.tcard {
  position: relative;
  border-radius: 20px;
  isolation: isolate;
  will-change: transform;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  width: 400px;
}
@media (max-width: 480px) { .tcard { width: 320px; } }

.tcard:hover { transform: translateY(-4px); }

.tcard__border {
  position: absolute; inset: -1px; border-radius: 21px;
  pointer-events: none; z-index: 0;
}
.tcard__glow {
  position: absolute; inset: 0; border-radius: 20px;
  pointer-events: none; z-index: 0;
}

/* ── Inner ─────────────────────────────────────────────────────── */
.tcard__inner {
  position: relative; z-index: 1;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(17,17,17,0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 28px;
  display: flex; flex-direction: column; gap: 20px;
  height: 100%; box-sizing: border-box;
}

.tcard--featured .tcard__inner {
  border-color: rgba(99,102,241,0.18);
  background: rgba(17,17,17,0.95);
}

/* ── Top row ───────────────────────────────────────────────────── */
.tcard__top {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}

.tcard__stars { display: flex; gap: 3px; }
.tcard__star  { font-size: 12px; color: #2a2a2a; transition: color 0.2s; }
.tcard__star--lit { color: #f59e0b; }

.tcard__project-ref {
  font-size: 10px; font-weight: 600; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 160px;
}

/* ── Quote ─────────────────────────────────────────────────────── */
.tcard__quote {
  position: relative;
  font-size: 14px; line-height: 1.8; color: #c0c0c0;
  font-style: normal; margin: 0;
  padding-left: 0;
  flex: 1;
}

.tcard__quote-mark {
  position: absolute; top: -8px; left: -4px;
  font-size: 56px; line-height: 1; font-family: Georgia, serif;
  color: rgba(99,102,241,0.15); pointer-events: none; user-select: none;
}

/* ── Divider ───────────────────────────────────────────────────── */
.tcard__divider { height: 1px; border-radius: 1px; }

/* ── Author ────────────────────────────────────────────────────── */
.tcard__author {
  display: flex; align-items: center; gap: 14px;
}

.tcard__avatar {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.tcard__avatar-img { width: 100%; height: 100%; object-fit: cover; }
.tcard__avatar-initials {
  font-size: 15px; font-weight: 700; color: #e5e5e5; letter-spacing: -0.02em;
  font-family: 'Geist Mono', monospace;
}

.tcard__author-info { flex: 1; min-width: 0; }
.tcard__author-name {
  font-size: 14px; font-weight: 700; color: #e5e5e5;
  letter-spacing: -0.01em; line-height: 1.3;
}
.tcard__author-role {
  font-size: 12px; color: #737373; line-height: 1.4; margin-top: 2px;
}
.tcard__author-sep { color: #333; margin: 0 4px; }
.tcard__author-location {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; font-family: 'Geist Mono', monospace; color: #444; margin-top: 3px;
}

.tcard__logo-wrap { flex-shrink: 0; }
.tcard__logo { width: 36px; height: 36px; object-fit: contain; border-radius: 8px; }
.tcard__logo-placeholder {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; font-family: 'Geist Mono', monospace;
}

/* ── Engagement badge ──────────────────────────────────────────── */
.tcard__engagement {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; font-family: 'Geist Mono', monospace;
  color: #444; letter-spacing: 0.04em;
  padding: 6px 10px; border-radius: 7px;
  border: 1px solid #1a1a1a; background: rgba(255,255,255,0.02);
  width: fit-content;
}
</style>
