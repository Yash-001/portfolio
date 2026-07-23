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
        Placeholder testimonials — real client quotes will be added as they come in.
        Every engagement is direct, every outcome is measurable.
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
          <span class="tms-stat__value">5.0</span>
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

    <!-- ── Carousel row 1 (left → right) ─────────────────────── -->
    <div
      ref="carouselEl"
      class="tms-carousel-wrap"
      @mouseenter="pauseAll"
      @mouseleave="resumeAll"
    >
      <div class="tms-track tms-track--fwd">
        <TestimonialCard
          v-for="(t, i) in TESTIMONIALS_LOOP"
          :key="`fwd-${t.id}-${i}`"
          :testimonial="t"
          :color-index="i % 5"
        />
      </div>
    </div>

    <!-- ── Carousel row 2 (right → left) ─────────────────────── -->
    <div
      class="tms-carousel-wrap"
      @mouseenter="pauseAll"
      @mouseleave="resumeAll"
    >
      <div class="tms-track tms-track--rev">
        <TestimonialCard
          v-for="(t, i) in TESTIMONIALS_LOOP_REV"
          :key="`rev-${t.id}-${i}`"
          :testimonial="t"
          :color-index="(i + 2) % 5"
        />
      </div>
    </div>

    <!-- Fade edges -->
    <div
      class="tms-fade tms-fade--left"
      aria-hidden="true"
    />
    <div
      class="tms-fade tms-fade--right"
      aria-hidden="true"
    />

    <!-- CTA -->
    <div
      ref="ctaEl"
      class="tms-section__cta"
    >
      <p class="tms-cta__note">
        <i
          class="pi pi-info-circle"
          style="font-size:12px; color:#555;"
        />
        These are placeholder testimonials. Real client quotes will replace them as they are collected.
      </p>
      <a
        href="/#contact"
        class="tms-cta__btn"
      >
        <i class="pi pi-send" />
        <span>Work with me</span>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'
import { TESTIMONIALS_LOOP } from '@/constants/testimonials.constants'
import TestimonialCard from './TestimonialCard.vue'

// Reversed copy for second row
const TESTIMONIALS_LOOP_REV = [...TESTIMONIALS_LOOP].reverse()

// ── Pause / resume carousel on hover ─────────────────────────────
const isPaused = ref(false)

function pauseAll()  { isPaused.value = true  }
function resumeAll() { isPaused.value = false }

// Toggle CSS animation-play-state via class on tracks — scoped to this section
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
    gsap.fromTo(carouselEl.value,
      { opacity: 0, y: 32 },
      { scrollTrigger: { trigger: carouselEl.value, start: 'top 90%', once: true },
        opacity: 1, y: 0, duration: 0.7, ease, clearProps: 'all' },
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

/* Forward: left to right */
.tms-track--fwd {
  animation: scrollFwd 60s linear infinite;
}

/* Reverse: right to left */
.tms-track--rev {
  animation: scrollRev 55s linear infinite;
}

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
  gap: 24px; flex-wrap: wrap;
}

.tms-cta__note {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-family: 'Geist Mono', monospace;
  color: #444; line-height: 1.5; max-width: 480px; text-align: center;
}

.tms-cta__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 600;
  text-decoration: none; letter-spacing: 0.02em; flex-shrink: 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,0.3);
  transition: box-shadow 0.3s, transform 0.2s;
}
.tms-cta__btn:hover {
  box-shadow: 0 8px 32px rgba(99,102,241,0.5); transform: translateY(-2px);
}
</style>
