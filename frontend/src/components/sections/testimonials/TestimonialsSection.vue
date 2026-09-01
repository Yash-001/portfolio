<template>
  <section
    id="testimonials"
    ref="sectionEl"
    class="tms-section"
    aria-label="Client testimonials"
  >
    <!-- Background -->
    <div
      class="tms-section__bg"
      aria-hidden="true"
    >
      <div class="tms-orb tms-orb--1" />
      <div class="tms-orb tms-orb--2" />
    </div>

    <!-- Header -->
    <div class="tms-section__header">
      <div
        ref="labelEl"
        class="tms-label"
      >
        <span class="tms-label__line" />
        <span class="tms-label__text">Testimonials</span>
      </div>

      <h2
        ref="headingEl"
        class="tms-section__heading"
      >
        What clients say.<br />
        <span class="tms-heading-accent">In their own words.</span>
      </h2>

      <p
        ref="subEl"
        class="tms-section__sub"
      >
        Real feedback from clients I've worked with directly.
        Every engagement is measurable, every outcome is real.
      </p>

      <!-- Summary stats -->
      <div
        ref="statsEl"
        class="tms-stats"
      >
        <div class="tms-stat">
          <span class="tms-stat__value">6+</span>
          <span class="tms-stat__label">Enterprise clients</span>
        </div>
        <div
          class="tms-stat__sep"
          aria-hidden="true"
        />
        <div class="tms-stat">
          <span class="tms-stat__value">7+</span>
          <span class="tms-stat__label">Years delivering</span>
        </div>
        <div
          class="tms-stat__sep"
          aria-hidden="true"
        />
        <div class="tms-stat">
          <span class="tms-stat__value">{{ avgRating }}</span>
          <span class="tms-stat__label">Avg rating</span>
        </div>
        <div
          class="tms-stat__sep"
          aria-hidden="true"
        />
        <div class="tms-stat">
          <span class="tms-stat__value">100%</span>
          <span class="tms-stat__label">On-time delivery</span>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="tms-loading"
      aria-live="polite"
    >
      <span
        class="tms-spinner"
        aria-hidden="true"
      />
      <span>Loading reviews…</span>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="reviews.length === 0"
      ref="carouselEl"
      class="tms-empty"
    >
      <i
        class="pi pi-star tms-empty__icon"
        aria-hidden="true"
      />
      <p class="tms-empty__text">
        No client reviews yet.
      </p>
      <p class="tms-empty__sub">
        Be the first to share your experience.
      </p>
    </div>

    <!-- Static grid (1–3 reviews, no animation) -->
    <div
      v-else-if="testimonials.length <= 3"
      class="tms-static-grid"
    >
      <TestimonialCard
        v-for="(t, i) in testimonials"
        :key="t.id"
        :testimonial="t"
        :color-index="i"
      />
    </div>

    <!-- Carousel rows (4+ reviews) -->
    <template v-else>
      <!-- Row 1: first 4 cards, always animating left → right -->
      <div
        ref="carouselEl"
        class="tms-carousel-wrap"
        @mouseenter="pauseAll"
        @mouseleave="resumeAll"
      >
        <div
          class="tms-track tms-track--fwd"
          :style="{ '--dur': `${fwdDuration}s` }"
        >
          <TestimonialCard
            v-for="(t, i) in loopFwd"
            :key="`fwd-${t.id}-${i}`"
            :testimonial="t"
            :color-index="i % 5"
          />
        </div>
      </div>

      <!-- Row 2: remaining cards (5th onward), static if ≤3, animating if >3 -->
      <div
        v-if="row2Cards.length > 0"
        class="tms-carousel-wrap"
        @mouseenter="pauseAll"
        @mouseleave="resumeAll"
      >
        <!-- static: ≤3 remaining -->
        <div v-if="row2Cards.length <= 3" class="tms-row2-static">
          <TestimonialCard
            v-for="(t, i) in row2Cards"
            :key="`row2-${t.id}`"
            :testimonial="t"
            :color-index="(i + 2) % 5"
          />
        </div>
        <!-- animated: >3 remaining -->
        <div
          v-else
          class="tms-track tms-track--rev"
          :style="{ '--dur': `${revDuration}s` }"
        >
          <TestimonialCard
            v-for="(t, i) in loopRev"
            :key="`rev-${t.id}-${i}`"
            :testimonial="t"
            :color-index="(i + 2) % 5"
          />
        </div>
      </div>
    </template>

    <!-- Fade edges (only when carousel is showing, 4+ reviews) -->
    <template v-if="reviews.length > 3">
      <div
        class="tms-fade tms-fade--left"
        aria-hidden="true"
      />
      <div
        class="tms-fade tms-fade--right"
        aria-hidden="true"
      />
    </template>

    <!-- CTA -->
    <div
      ref="ctaEl"
      class="tms-section__cta"
    >
      <button
        type="button"
        class="tms-cta__btn tms-cta__btn--review"
        @click="showModal = true"
      >
        <i class="pi pi-star" />
        <span>Leave a Review</span>
      </button>
      <a
        href="/#contact"
        class="tms-cta__btn"
      >
        <i class="pi pi-send" />
        <span>Work with me</span>
      </a>
    </div>

    <!-- Review modal -->
    <ReviewModal
      v-model="showModal"
      @submitted="onReviewSubmitted"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'
import { getPublicReviews, type PublicReview } from '@/services/review.service'
import type { TestimonialFull } from '@/types/content'
import TestimonialCard from './TestimonialCard.vue'
import ReviewModal from './ReviewModal.vue'

// ── Data ──────────────────────────────────────────────────────────
const reviews = ref<PublicReview[]>([])
const loading = ref(true)
const showModal = ref(false)

async function fetchReviews() {
  loading.value = true
  try {
    reviews.value = await getPublicReviews()
  } catch {
    reviews.value = []
  } finally {
    loading.value = false
  }
}

function onReviewSubmitted() {
  fetchReviews()
}

// ── Map API reviews → TestimonialFull for TestimonialCard ─────────
function toTestimonialFull(r: PublicReview, idx: number): TestimonialFull {
  return {
    id: `review-${r.id}`,
    quote: r.review_text,
    author: r.client_name,
    role: r.role ?? '',
    company: r.company ?? '',
    avatar: undefined,
    linkedIn: undefined,
    rating: r.rating as 1 | 2 | 3 | 4 | 5,
    companyLogo: undefined,
    companyUrl: undefined,
    projectRef: r.project_ref ?? undefined,
    engagement: r.engagement_type ?? undefined,
    location: r.location ?? undefined,
    date: r.created_at ?? undefined,
    featured: idx < 3,
    order: idx + 1,
  }
}

const testimonials = computed<TestimonialFull[]>(() =>
  reviews.value.map((r, i) => toTestimonialFull(r, i)),
)

// Build seamless infinite-scroll loop.
// Each half = the real reviews (no artificial padding).
// Minimum 3 copies so the track is always wider than the viewport.
// ── Carousel loop (only used when reviews.length > 1) ───────────
// The animation translates from 0 → -50%, so the half-track must be
// at least as wide as the viewport. Card = 360px + 20px gap = 380px.
// copies = how many times we repeat the real reviews to fill one viewport.
const CARD_W = 380

const ROW1_SIZE = 4

// Row 1: always the first 4 cards, looped for seamless animation
const loopFwd = computed(() => {
  const base = testimonials.value.slice(0, ROW1_SIZE)
  if (base.length < ROW1_SIZE) return []
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const copies = Math.max(1, Math.ceil(vw / (base.length * CARD_W)))
  const half = Array.from({ length: copies }, () => base).flat()
  return [...half, ...half]
})

// Row 2: cards beyond the first 4
const row2Cards = computed(() => testimonials.value.slice(ROW1_SIZE))

// Row 2 loop: only built when row2 has >3 cards
const loopRev = computed(() => {
  const base = row2Cards.value
  if (base.length <= 3) return []
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const copies = Math.max(1, Math.ceil(vw / (base.length * CARD_W)))
  const half = Array.from({ length: copies }, () => base).flat()
  return [...half, ...half]
})

// Duration: 20s per unique review, clamped 45s–120s
const fwdDuration = computed(() => Math.min(120, Math.max(45, testimonials.value.length * 20)))
const revDuration = computed(() => fwdDuration.value + 8)

const avgRating = computed(() => {
  if (reviews.value.length === 0) return '—'
  const avg = reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length
  return avg.toFixed(1)
})

// ── Pause / resume carousel on hover ─────────────────────────────
const isPaused = ref(false)
function pauseAll()  { isPaused.value = true  }
function resumeAll() { isPaused.value = false }

watch(isPaused, (paused) => {
  sectionEl.value?.querySelectorAll<HTMLElement>('.tms-track').forEach(el => {
    el.style.animationPlayState = paused ? 'paused' : 'running'
  })
})

// ── GSAP entrance ─────────────────────────────────────────────────
const sectionEl  = ref<HTMLElement | null>(null)
const labelEl    = ref<HTMLElement | null>(null)
const headingEl  = ref<HTMLElement | null>(null)
const subEl      = ref<HTMLElement | null>(null)
const statsEl    = ref<HTMLElement | null>(null)
const carouselEl = ref<HTMLElement | null>(null)
const ctaEl      = ref<HTMLElement | null>(null)

let gsapCtx: ReturnType<typeof gsap.context> | null = null

onMounted(() => {
  fetchReviews()

  gsapCtx = gsap.context(() => {
    const ease = 'power3.out'

    gsap.fromTo(labelEl.value,
      { opacity: 0, x: -24 },
      { scrollTrigger: { trigger: labelEl.value, start: 'top 88%', once: true },
        opacity: 1, x: 0, duration: 0.6, ease, clearProps: 'all' },
    )
    gsap.fromTo(headingEl.value,
      { opacity: 0, y: 32 },
      { scrollTrigger: { trigger: headingEl.value, start: 'top 85%', once: true },
        opacity: 1, y: 0, duration: 0.8, ease, clearProps: 'all' },
    )
    gsap.fromTo(subEl.value,
      { opacity: 0, y: 20 },
      { scrollTrigger: { trigger: subEl.value, start: 'top 88%', once: true },
        opacity: 1, y: 0, duration: 0.6, ease, delay: 0.1, clearProps: 'all' },
    )
    gsap.fromTo(statsEl.value!.querySelectorAll('.tms-stat'),
      { opacity: 0, y: 20 },
      { scrollTrigger: { trigger: statsEl.value, start: 'top 88%', once: true },
        opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease, clearProps: 'all' },
    )
    gsap.fromTo(ctaEl.value,
      { opacity: 0, y: 24 },
      { scrollTrigger: { trigger: ctaEl.value, start: 'top 90%', once: true },
        opacity: 1, y: 0, duration: 0.6, ease, clearProps: 'all' },
    )
  }, sectionEl.value!)
})

onUnmounted(() => gsapCtx?.revert())
</script>

<style scoped>
/* ── Section ───────────────────────────────────────────────────── */
.tms-section {
  position: relative;
  padding: 120px 0 100px;
  background: #0a0a0a;
  overflow: hidden;
}

/* ── Background ────────────────────────────────────────────────── */
.tms-section__bg { position: absolute; inset: 0; pointer-events: none; }
.tms-orb {
  position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none;
}
.tms-orb--1 {
  width: 600px; height: 600px; top: -100px; left: -150px;
  background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
  animation: tmsOrb 16s ease-in-out infinite;
}
.tms-orb--2 {
  width: 500px; height: 500px; bottom: 0; right: -100px;
  background: radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%);
  animation: tmsOrb 20s ease-in-out infinite reverse;
}
@keyframes tmsOrb {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(30px, -40px); }
}

/* ── Header ────────────────────────────────────────────────────── */
.tms-section__header {
  max-width: 1280px; margin: 0 auto; padding: 0 24px;
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; text-align: center; margin-bottom: 64px;
}

.tms-label { display: flex; align-items: center; gap: 16px; }
.tms-label__line { display: block; width: 40px; height: 1px; background: #6366f1; flex-shrink: 0; }
.tms-label__text {
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: #6366f1; font-family: 'Geist Mono', monospace;
}

.tms-section__heading {
  font-size: clamp(32px, 4vw, 56px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.1; color: #f5f5f5;
}
.tms-heading-accent {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.tms-section__sub {
  font-size: 15px; line-height: 1.7; color: #737373; max-width: 480px;
}

/* Stats row */
.tms-stats {
  display: flex; align-items: center; gap: 0;
  border: 1px solid #1a1a1a; border-radius: 14px; overflow: hidden;
  background: #111;
}
.tms-stat {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 18px 28px; background: #0d0d0d; transition: background 0.2s;
}
.tms-stat:hover { background: #111; }
.tms-stat__value {
  font-size: 24px; font-weight: 800; letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #f5f5f5, #a0a0a0);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tms-stat__label {
  font-size: 10px; font-family: 'Geist Mono', monospace;
  color: #555; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap;
}
.tms-stat__sep { width: 1px; height: 48px; background: #1a1a1a; flex-shrink: 0; }

@media (max-width: 640px) {
  .tms-stats { flex-wrap: wrap; }
  .tms-stat  { flex: 1; min-width: 120px; }
  .tms-stat__sep { display: none; }
}

/* ── Loading ───────────────────────────────────────────────────── */
.tms-loading {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 60px 24px; font-size: 14px; color: #555;
}
.tms-spinner {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid rgba(99,102,241,0.3); border-top-color: #6366f1;
  animation: tmsSpin 0.7s linear infinite; display: inline-block;
}
@keyframes tmsSpin { to { transform: rotate(360deg); } }

/* ── Empty state ───────────────────────────────────────────────── */
.tms-empty {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 80px 24px; text-align: center;
}
.tms-empty__icon { font-size: 40px; color: #2a2a2a; }
.tms-empty__text { font-size: 18px; font-weight: 600; color: #555; }
.tms-empty__sub  { font-size: 14px; color: #3a3a3a; }

/* ── Static grid (1–3 reviews) ─────────────────────────────────── */
.tms-static-grid {
  display: flex; justify-content: center; flex-wrap: wrap;
  gap: 20px; padding: 0 24px 20px;
}

/* Row 2 static (≤3 remaining cards) */
.tms-row2-static {
  display: flex; justify-content: center; flex-wrap: wrap;
  gap: 20px; padding: 12px 24px;
}

/* ── Carousel ──────────────────────────────────────────────────── */
.tms-carousel-wrap {
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  padding: 12px 0;
}

.tms-track {
  display: flex;
  gap: 20px;
  width: max-content;
  will-change: transform;
}

.tms-track--fwd { animation: scrollFwd var(--dur, 20s) linear infinite; }
.tms-track--rev { animation: scrollRev var(--dur, 18s) linear infinite; }

@keyframes scrollFwd {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes scrollRev {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}

/* Fade edges */
.tms-fade {
  position: absolute;
  top: 0; bottom: 0;
  width: 160px;
  pointer-events: none;
  z-index: 10;
}
.tms-fade--left  {
  left: 0;
  background: linear-gradient(to right, #0a0a0a 0%, transparent 100%);
}
.tms-fade--right {
  right: 0;
  background: linear-gradient(to left, #0a0a0a 0%, transparent 100%);
}

/* ── CTA ───────────────────────────────────────────────────────── */
.tms-section__cta {
  max-width: 1280px; margin: 48px auto 0; padding: 0 24px;
  display: flex; align-items: center; justify-content: center;
  gap: 16px; flex-wrap: wrap;
}

.tms-cta__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 600;
  text-decoration: none; letter-spacing: 0.02em; flex-shrink: 0; cursor: pointer;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,0.3);
  transition: box-shadow 0.3s, transform 0.2s;
  border: none;
}
.tms-cta__btn:hover {
  box-shadow: 0 8px 32px rgba(99,102,241,0.5); transform: translateY(-2px);
}

.tms-cta__btn--review {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: none;
  color: #d4d4d4;
}
.tms-cta__btn--review:hover {
  border-color: rgba(99,102,241,0.4);
  background: rgba(99,102,241,0.08);
  color: #a5b4fc;
  box-shadow: none;
  transform: translateY(-2px);
}
</style>
