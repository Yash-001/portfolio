<template>
  <section
    id="experience"
    ref="sectionEl"
    class="exp-section"
    aria-label="Work experience"
  >
    <!-- Ambient background -->
    <div
      class="exp-section__bg"
      aria-hidden="true"
    >
      <div class="bg-orb bg-orb--1" />
      <div class="bg-orb bg-orb--2" />
    </div>

    <!-- ── Section header ──────────────────────────────────────── -->
    <div class="exp-section__header">
      <div
        ref="labelEl"
        class="section-label"
      >
        <span class="label-line" />
        <span class="label-text">{{ t('experience.label') }}</span>
      </div>

      <h2
        ref="headingEl"
        class="exp-section__heading"
      >
        {{ t('experience.heading') }}<br />
        <span class="heading-accent">{{ t('experience.headingAccent') }}</span>
      </h2>

      <p
        ref="subEl"
        class="exp-section__sub"
      >
        {{ t('experience.sub') }}
      </p>
    </div>

    <!-- ── Timeline ───────────────────────────────────────────── -->
    <div class="exp-section__timeline-wrap">
      <div
        ref="timelineEl"
        class="exp-timeline"
      >
        <!-- Animated spine -->
        <div
          class="exp-timeline__spine-track"
          aria-hidden="true"
        >
          <div
            ref="spineEl"
            class="exp-timeline__spine"
          />
        </div>

        <!-- Experience items -->
        <div
          v-for="(exp, index) in EXPERIENCES"
          :key="exp.id"
          ref="itemEls"
          class="exp-timeline__item"
          :class="{ 'exp-timeline__item--right': index % 2 !== 0 }"
        >
          <!-- Connector dot -->
          <div
            class="exp-timeline__dot"
            aria-hidden="true"
          >
            <div
              class="exp-timeline__dot-ring"
              :class="{ 'exp-timeline__dot-ring--active': exp.current }"
            />
            <div
              class="exp-timeline__dot-core"
              :class="{ 'exp-timeline__dot-core--active': exp.current }"
            />
          </div>

          <!-- Year label on spine -->
          <div
            class="exp-timeline__year"
            :class="{ 'exp-timeline__year--right': index % 2 !== 0 }"
          >
            {{ exp.startDate.split('-')[0] }}
          </div>

          <!-- Card -->
          <ExperienceCard :experience="exp" />
        </div>
      </div>
    </div>

    <!-- ── Summary strip ──────────────────────────────────────── -->
    <div
      ref="summaryEl"
      class="exp-summary"
    >
      <div
        v-for="item in SUMMARY"
        :key="item.key"
        class="exp-summary__item"
      >
        <span class="exp-summary__value">{{ t(`experience.summary.${item.key}.value`) }}</span>
        <span class="exp-summary__label">{{ t(`experience.summary.${item.key}.label`) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap, ScrollTrigger } from '@/plugins/gsap'
import { EXPERIENCES } from '@/constants'
import ExperienceCard from './ExperienceCard.vue'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()

const SUMMARY = [
  { key: 'years'     },
  { key: 'companies' },
  { key: 'txn'       },
  { key: 'latency'   },
] as const

// ── Refs ──────────────────────────────────────────────────────────
const sectionEl  = ref<HTMLElement | null>(null)
const labelEl    = ref<HTMLElement | null>(null)
const headingEl  = ref<HTMLElement | null>(null)
const subEl      = ref<HTMLElement | null>(null)
const timelineEl = ref<HTMLElement | null>(null)
const spineEl    = ref<HTMLElement | null>(null)
const itemEls    = ref<HTMLElement[]>([])
const summaryEl  = ref<HTMLElement | null>(null)

// ── GSAP animations ───────────────────────────────────────────────
let gsapCtx: ReturnType<typeof gsap.context> | null = null

onMounted(() => {
  gsapCtx = gsap.context(() => {
    const ease = 'power3.out'

    gsap.from(labelEl.value, {
      scrollTrigger: { trigger: labelEl.value, start: 'top 88%', once: true },
      opacity: 0, x: -24, duration: 0.6, ease,
    })

    gsap.from(headingEl.value, {
      scrollTrigger: { trigger: headingEl.value, start: 'top 85%', once: true },
      opacity: 0, y: 32, duration: 0.8, ease,
    })

    gsap.from(subEl.value, {
      scrollTrigger: { trigger: subEl.value, start: 'top 88%', once: true },
      opacity: 0, y: 20, duration: 0.6, ease, delay: 0.1,
    })

    gsap.fromTo(
      spineEl.value,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: timelineEl.value,
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: 0.8,
        },
      },
    )

    itemEls.value.forEach((el, i) => {
      const isRight = i % 2 !== 0
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        opacity: 0,
        x: isRight ? 48 : -48,
        y: 24,
        duration: 0.75,
        ease,
        delay: 0.05,
      })
    })

    gsap.from(summaryEl.value!.querySelectorAll('.exp-summary__item'), {
      scrollTrigger: { trigger: summaryEl.value, start: 'top 88%', once: true },
      opacity: 0, y: 20, duration: 0.5, ease, stagger: 0.08,
    })

  }, sectionEl.value!)
})

onUnmounted(() => {
  gsapCtx?.revert()
  ScrollTrigger.getAll().forEach((t) => t.kill())
})
</script>

<style scoped>
/* ── Section shell ─────────────────────────────────────────────── */
.exp-section {
  position: relative;
  padding: 120px 0 100px;
  background: var(--bg-base);
  overflow: hidden;
}

/* ── Background orbs ───────────────────────────────────────────── */
.exp-section__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}

.bg-orb--1 {
  width: 600px;
  height: 600px;
  top: 0;
  left: -200px;
  background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, transparent 70%);
}

.bg-orb--2 {
  width: 400px;
  height: 400px;
  bottom: 10%;
  right: -100px;
  background: radial-gradient(circle, color-mix(in srgb, var(--color-accent) 5%, transparent) 0%, transparent 70%);
}

/* ── Header ────────────────────────────────────────────────────── */
.exp-section__header {
  max-width: 1280px;
  margin: 0 auto 72px;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 16px;
}

.label-line {
  display: block;
  width: 40px;
  height: 1px;
  background: var(--color-primary);
  flex-shrink: 0;
}

.label-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary);
  font-family: 'Geist Mono', monospace;
}

.exp-section__heading {
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--text-primary);
  max-width: 640px;
}

.heading-accent {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.exp-section__sub {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-tertiary);
  max-width: 480px;
}

/* ── Timeline wrapper ──────────────────────────────────────────── */
.exp-section__timeline-wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── Timeline ──────────────────────────────────────────────────── */
.exp-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Spine track */
.exp-timeline__spine-track {
  display: none;
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

@media (min-width: 1024px) {
  .exp-timeline__spine-track { display: block; }
}

.exp-timeline__spine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--color-primary) 8%,
    var(--color-accent) 50%,
    var(--color-primary) 92%,
    transparent 100%
  );
  transform-origin: top center;
}

/* Timeline item */
.exp-timeline__item {
  position: relative;
  padding: 0 0 48px 0;
  width: 100%;
}

@media (min-width: 1024px) {
  .exp-timeline__item {
    width: calc(50% - 40px);
    padding: 0 0 56px 0;
    align-self: flex-start;
  }

  .exp-timeline__item:nth-child(odd) {
    margin-right: auto;
    padding-right: 48px;
  }

  .exp-timeline__item--right {
    margin-left: auto;
    padding-left: 48px;
    padding-right: 0;
    margin-top: -120px;
  }
}

/* Connector dot */
.exp-timeline__dot {
  display: none;
  position: absolute;
  top: 24px;
  right: -8px;
  width: 16px;
  height: 16px;
  z-index: 2;
}

@media (min-width: 1024px) {
  .exp-timeline__dot { display: flex; align-items: center; justify-content: center; }

  .exp-timeline__item--right .exp-timeline__dot {
    right: auto;
    left: -8px;
  }
}

.exp-timeline__dot-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--border-active);
  background: var(--bg-base);
  transition: border-color 0.3s;
}

.exp-timeline__dot-ring--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-primary) 40%, transparent);
}

.exp-timeline__dot-core {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border-active);
  position: relative;
  z-index: 1;
  transition: background-color 0.3s;
}

.exp-timeline__dot-core--active {
  background: var(--color-primary);
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(99,102,241,0); }
}

/* Year label */
.exp-timeline__year {
  display: none;
  position: absolute;
  top: 20px;
  right: calc(100% + 56px);
  font-size: 11px;
  font-weight: 700;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  text-transform: uppercase;
  white-space: nowrap;
}

@media (min-width: 1024px) {
  .exp-timeline__year { display: block; }

  .exp-timeline__year--right {
    right: auto;
    left: calc(100% + 56px);
  }
}

/* ── Summary strip ─────────────────────────────────────────────── */
.exp-summary {
  max-width: 1280px;
  margin: 56px auto 0;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  overflow: hidden;
  background: var(--border-subtle);
}

@media (min-width: 640px) {
  .exp-summary { grid-template-columns: repeat(4, 1fr); }
}

.exp-summary__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 20px;
  background: var(--bg-base);
  transition: background-color 0.2s;
}

.exp-summary__item:hover { background: var(--bg-primary); }

.exp-summary__value {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-variant-numeric: tabular-nums;
}

.exp-summary__label {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.04em;
  text-align: center;
}
</style>
