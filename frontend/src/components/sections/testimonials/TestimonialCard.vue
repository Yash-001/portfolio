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
    <div class="tcard__border" :style="borderStyle" aria-hidden="true" />
    <div class="tcard__glow"   :style="glowStyle"   aria-hidden="true" />

    <div class="tcard__inner">
      <!-- Top row: stars + project ref -->
      <div class="tcard__top">
        <div class="tcard__stars" :aria-label="`${testimonial.rating} out of 5 stars`">
          <!-- Only render as many stars as the rating (ceil), last star may be half-filled -->
          <svg
            v-for="n in Math.ceil(testimonial.rating)"
            :key="n"
            class="tcard__star-svg"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath :id="`half-card-${testimonial.id}-${n}`">
                <rect x="0" y="0" width="12" height="24" />
              </clipPath>
            </defs>
            <!-- dim base -->
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="rgba(180,140,0,0.15)" stroke="#c8a000" stroke-width="1" stroke-opacity="0.7"
            />
            <!-- full lit -->
            <path
              v-if="n <= Math.floor(testimonial.rating)"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="#f59e0b"
            />
            <!-- half lit -->
            <path
              v-else-if="testimonial.rating % 1 !== 0"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="#f59e0b"
              :clip-path="`url(#half-card-${testimonial.id}-${n})`"
            />
          </svg>
        </div>
        <span v-if="testimonial.projectRef" class="tcard__project-ref">
          {{ testimonial.projectRef }}
        </span>
      </div>

      <!-- Quote -->
      <blockquote class="tcard__quote">
        <span class="tcard__quote-mark" aria-hidden="true">"</span>
        {{ truncatedQuote }}<span v-if="isTruncated" class="tcard__ellipsis">…</span>
      </blockquote>

      <!-- Divider -->
      <div class="tcard__divider" :style="dividerStyle" />

      <!-- Author row -->
      <div class="tcard__author">
        <div class="tcard__avatar" :style="avatarStyle">
          <img v-if="testimonial.avatar" :src="testimonial.avatar" :alt="testimonial.author" class="tcard__avatar-img" />
          <span v-else class="tcard__avatar-initials">{{ initials }}</span>
        </div>
        <div class="tcard__author-info">
          <div class="tcard__author-name">{{ testimonial.author }}</div>
          <div class="tcard__author-role">
            {{ testimonial.role }}<span class="tcard__author-sep" aria-hidden="true">·</span>{{ testimonial.company }}
          </div>
          <div v-if="testimonial.location" class="tcard__author-location">
            <i class="pi pi-map-marker" style="font-size:9px;" />
            {{ testimonial.location }}
          </div>
        </div>
        <div class="tcard__logo-wrap" :title="testimonial.company">
          <img v-if="testimonial.companyLogo" :src="testimonial.companyLogo" :alt="testimonial.company" class="tcard__logo" />
          <div v-else class="tcard__logo-placeholder" :style="logoPlaceholderStyle">
            {{ testimonial.company.charAt(0) }}
          </div>
        </div>
      </div>

      <!-- Footer: engagement + date -->
      <div class="tcard__footer">
        <div v-if="testimonial.engagement" class="tcard__engagement">
          <i class="pi pi-briefcase" style="font-size:9px;" />
          {{ testimonial.engagement }}
        </div>
        <div v-if="testimonial.date" class="tcard__date">
          <i class="pi pi-calendar" style="font-size:9px;" />
          {{ formattedDate }}
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TestimonialFull } from '@/constants/testimonials.constants'

const props = defineProps<{ testimonial: TestimonialFull; colorIndex?: number }>()

const ACCENTS = [
  { from: '#6366f1', to: '#8b5cf6', glow: 'rgba(99,102,241,0.2)'  },
  { from: '#10b981', to: '#06b6d4', glow: 'rgba(16,185,129,0.2)'  },
  { from: '#8b5cf6', to: '#ec4899', glow: 'rgba(139,92,246,0.2)'  },
  { from: '#f59e0b', to: '#ef4444', glow: 'rgba(245,158,11,0.2)'  },
  { from: '#06b6d4', to: '#6366f1', glow: 'rgba(6,182,212,0.2)'   },
]
const accent = computed(() => ACCENTS[(props.colorIndex ?? 0) % ACCENTS.length])

const QUOTE_MAX = 300
const truncatedQuote = computed(() => props.testimonial.quote.slice(0, QUOTE_MAX))
const isTruncated    = computed(() => props.testimonial.quote.length > QUOTE_MAX)

const formattedDate = computed(() => {
  if (!props.testimonial.date) return ''
  return new Date(props.testimonial.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
})

const initials = computed(() => {
  const p = props.testimonial.author.split(' ')
  return p.length >= 2 ? `${p[0][0]}${p[p.length - 1][0]}` : p[0][0]
})

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
const dividerStyle = computed(() => ({ background: `linear-gradient(90deg, ${accent.value.from}55, transparent)` }))
const avatarStyle  = computed(() => ({ background: `linear-gradient(135deg, ${accent.value.from}33, ${accent.value.to}22)`, border: `1px solid ${accent.value.from}44` }))
const logoPlaceholderStyle = computed(() => ({ background: `linear-gradient(135deg, ${accent.value.from}22, ${accent.value.to}11)`, border: `1px solid ${accent.value.from}33`, color: accent.value.from }))
</script>

<style scoped>
.tcard {
  position: relative; border-radius: 20px; isolation: isolate;
  will-change: transform; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0; width: 360px; min-height: 420px;
  display: flex; flex-direction: column;
}
@media (max-width: 480px) { .tcard { width: 300px; min-height: 380px; } }
.tcard:hover { transform: translateY(-4px); }

.tcard__border { position: absolute; inset: -1px; border-radius: 21px; pointer-events: none; z-index: 0; }
.tcard__glow   { position: absolute; inset: 0;   border-radius: 20px; pointer-events: none; z-index: 0; }

.tcard__inner {
  position: relative; z-index: 1; border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(17,17,17,0.88);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  padding: 28px; display: flex; flex-direction: column; gap: 20px;
  flex: 1; box-sizing: border-box;
}
.tcard--featured .tcard__inner { border-color: rgba(99,102,241,0.18); background: rgba(17,17,17,0.95); }

.tcard__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

/* SVG stars — always visible, gold stroke on unlit */
.tcard__stars { display: flex; gap: 3px; }
.tcard__star-svg {
  width: 15px; height: 15px; display: block;
  filter: drop-shadow(0 0 2px rgba(200,160,0,0.3));
}

.tcard__project-ref {
  font-size: 10px; font-weight: 600; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;
}

.tcard__quote {
  position: relative; font-size: 14px; line-height: 1.8; color: #b8b8b8;
  font-style: normal; margin: 0; flex-grow: 1; min-height: 8em; overflow: hidden;
}
.tcard__ellipsis { color: #555; }
.tcard__quote-mark {
  position: absolute; top: -8px; left: -4px;
  font-size: 56px; line-height: 1; font-family: Georgia, serif;
  color: rgba(99,102,241,0.15); pointer-events: none; user-select: none;
}

.tcard__divider { height: 1px; border-radius: 1px; }

.tcard__author { display: flex; align-items: center; gap: 14px; }
.tcard__avatar {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.tcard__avatar-img { width: 100%; height: 100%; object-fit: cover; }
.tcard__avatar-initials {
  font-size: 15px; font-weight: 700; color: #e5e5e5;
  letter-spacing: -0.02em; font-family: 'Geist Mono', monospace;
}
.tcard__author-info { flex: 1; min-width: 0; }
.tcard__author-name { font-size: 14px; font-weight: 700; color: #e5e5e5; letter-spacing: -0.01em; line-height: 1.3; }
.tcard__author-role { font-size: 12px; color: #737373; line-height: 1.4; margin-top: 2px; }
.tcard__author-sep  { color: #333; margin: 0 4px; }
.tcard__author-location { display: flex; align-items: center; gap: 4px; font-size: 10px; font-family: 'Geist Mono', monospace; color: #444; margin-top: 3px; }
.tcard__logo-wrap { flex-shrink: 0; }
.tcard__logo { width: 36px; height: 36px; object-fit: contain; border-radius: 8px; }
.tcard__logo-placeholder {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; font-family: 'Geist Mono', monospace;
}

.tcard__footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.tcard__engagement {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; font-family: 'Geist Mono', monospace; color: #444; letter-spacing: 0.04em;
  padding: 6px 10px; border-radius: 7px; border: 1px solid #1a1a1a; background: rgba(255,255,255,0.02);
}
.tcard__date {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; font-family: 'Geist Mono', monospace; color: #3a3a3a; letter-spacing: 0.04em;
}
</style>
