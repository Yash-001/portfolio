<template>
  <section
    id="about"
    ref="sectionEl"
    class="about-section"
    aria-label="About Yash Ranjan"
  >
    <!-- Section label -->
    <div
      ref="labelEl"
      class="section-label"
    >
      <span class="label-line" />
      <span class="label-text">{{ t('about.label') }}</span>
    </div>

    <div class="about-inner">
      <!-- ══ LEFT — Story ══════════════════════════════════════ -->
      <div class="about-story">
        <h2
          ref="headingEl"
          class="about-heading"
        >
          {{ t('about.heading') }}<br />
          <span class="heading-accent">{{ t('about.headingAccent') }}</span>
        </h2>

        <div
          ref="storyEl"
          class="story-body"
        >
          <p v-for="(para, i) in (tm('about.story') as string[])"
            :key="i">{{ para }}</p>
        </div>

        <!-- Signature -->
        <div
          ref="signatureEl"
          class="signature-block"
        >
          <div class="signature-line" />
          <div class="signature-meta">
            <span class="signature-name">{{ APP_NAME }}</span>
            <span class="signature-title">{{ t('about.signatureTitle', { years: APP_YEARS_EXPERIENCE }) }}</span>
          </div>
        </div>
      </div>

      <!-- ══ RIGHT — Cards + Stack ══════════════════════════════ -->
      <div class="about-aside">
        <!-- Philosophy cards -->
        <div
          ref="cardsEl"
          class="philosophy-grid"
        >
          <div
            v-for="card in PHILOSOPHY"
            :key="card.key"
            class="philosophy-card"
          >
            <div class="card-icon-wrap">
              <i
                :class="card.icon"
                class="card-icon"
              />
            </div>
            <h3 class="card-title">{{ t(`about.philosophy.${card.key}.title`) }}</h3>
            <p class="card-body">{{ t(`about.philosophy.${card.key}.body`) }}</p>
          </div>
        </div>

        <!-- Currently working with -->
        <div
          ref="stackEl"
          class="stack-block"
        >
          <p class="stack-label">{{ t('common.misc.currentlyWorkingWith') }}</p>
          <div class="stack-pills">
            <span
              v-for="tech in TECH_STACK"
              :key="tech.name"
              class="stack-pill"
              :style="{ '--pill-color': tech.color }"
            >
              {{ tech.name }}
            </span>
          </div>
        </div>

        <!-- Location + availability -->
        <div
          ref="metaEl"
          class="meta-strip"
        >
          <div class="meta-item">
            <i class="pi pi-map-marker meta-icon" />
            <span>{{ APP_LOCATION }}</span>
          </div>
          <div class="meta-divider" />
          <div class="meta-item">
            <span class="avail-dot" />
            <span class="avail-text">{{ APP_AVAILABILITY_TEXT }}</span>
          </div>
          <div class="meta-divider" />
          <div class="meta-item">
            <i class="pi pi-clock meta-icon" />
            <span>{{ t('about.respondsIn', { time: APP_RESPONSE_TIME }) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ Timeline ════════════════════════════════════════════ -->
    <div
      ref="timelineEl"
      class="timeline"
      aria-label="Career timeline"
    >
      <div
        v-for="(year, i) in TIMELINE_YEARS"
        :key="year"
        class="timeline-item"
        :class="{ 'timeline-item--right': i % 2 !== 0 }"
      >
        <div
          class="timeline-dot"
          aria-hidden="true"
        >
          <div class="timeline-dot__inner" />
        </div>
        <div class="timeline-card">
          <span class="timeline-year">{{ year }}</span>
          <h4 class="timeline-role">{{ t(`about.timeline.${year}.role`) }}</h4>
          <p class="timeline-company">{{ t(`about.timeline.${year}.company`) }}</p>
          <p class="timeline-desc">{{ t(`about.timeline.${year}.desc`) }}</p>
        </div>
      </div>
      <div
        class="timeline-spine"
        aria-hidden="true"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap, ScrollTrigger } from '@/plugins/gsap'
import {
  APP_NAME,
  APP_YEARS_EXPERIENCE,
  APP_LOCATION,
  APP_AVAILABILITY_TEXT,
  APP_RESPONSE_TIME,
} from '@/constants'
import { useLocale } from '@/composables/useLocale'

const { t, tm } = useLocale()

const PHILOSOPHY = [
  { key: 'systems', icon: 'pi pi-server' },
  { key: 'boring',  icon: 'pi pi-bolt'   },
  { key: 'domain',  icon: 'pi pi-sitemap' },
  { key: 'ai',      icon: 'pi pi-sparkles' },
] as const

const TECH_STACK = [
  { name: 'Java 21',      color: '#f89820' },
  { name: 'Spring Boot',  color: '#6db33f' },
  { name: 'Vue 3',        color: '#42b883' },
  { name: 'PostgreSQL',   color: '#336791' },
  { name: 'AWS',          color: '#ff9900' },
  { name: 'Docker',       color: '#2496ed' },
  { name: 'Kubernetes',   color: '#326ce5' },
  { name: 'Redis',        color: '#dc382d' },
  { name: 'Kafka',        color: '#a0a0a0' },
  { name: 'Jenkins',      color: '#d33833' },
  { name: 'TypeScript',   color: '#3178c6' },
  { name: 'OpenAI API',   color: '#10a37f' },
] as const

const TIMELINE_YEARS = ['2017', '2019', '2021', '2023'] as const

// ── Refs ──────────────────────────────────────────────────────────
const sectionEl   = ref<HTMLElement | null>(null)
const labelEl     = ref<HTMLElement | null>(null)
const headingEl   = ref<HTMLElement | null>(null)
const storyEl     = ref<HTMLElement | null>(null)
const signatureEl = ref<HTMLElement | null>(null)
const cardsEl     = ref<HTMLElement | null>(null)
const stackEl     = ref<HTMLElement | null>(null)
const metaEl      = ref<HTMLElement | null>(null)
const timelineEl  = ref<HTMLElement | null>(null)

// ── Animations ────────────────────────────────────────────────────
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
      { opacity: 0, y: 40 },
      { scrollTrigger: { trigger: headingEl.value, start: 'top 85%', once: true },
        opacity: 1, y: 0, duration: 0.8, ease, clearProps: 'all' },
    )

    gsap.fromTo(storyEl.value!.querySelectorAll('p'),
      { opacity: 0, y: 28 },
      { scrollTrigger: { trigger: storyEl.value, start: 'top 82%', once: true },
        opacity: 1, y: 0, duration: 0.7, ease, stagger: 0.14, clearProps: 'all' },
    )

    gsap.fromTo(signatureEl.value,
      { opacity: 0, x: -20 },
      { scrollTrigger: { trigger: signatureEl.value, start: 'top 90%', once: true },
        opacity: 1, x: 0, duration: 0.6, ease, delay: 0.2, clearProps: 'all' },
    )

    gsap.fromTo(cardsEl.value!.querySelectorAll('.philosophy-card'),
      { opacity: 0, y: 32, scale: 0.97 },
      { scrollTrigger: { trigger: cardsEl.value, start: 'top 82%', once: true },
        opacity: 1, y: 0, scale: 1, duration: 0.65, ease, stagger: 0.1, clearProps: 'all' },
    )

    gsap.fromTo(stackEl.value!.querySelectorAll('.stack-pill'),
      { opacity: 0, scale: 0.85 },
      { scrollTrigger: { trigger: stackEl.value, start: 'top 88%', once: true },
        opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.4)', stagger: 0.05, clearProps: 'all' },
    )

    gsap.fromTo(metaEl.value,
      { opacity: 0, y: 16 },
      { scrollTrigger: { trigger: metaEl.value, start: 'top 90%', once: true },
        opacity: 1, y: 0, duration: 0.5, ease, clearProps: 'all' },
    )

    gsap.fromTo(timelineEl.value!.querySelectorAll('.timeline-item'),
      { opacity: 0, y: 40 },
      { scrollTrigger: { trigger: timelineEl.value, start: 'top 80%', once: true },
        opacity: 1, y: 0, duration: 0.7, ease, stagger: 0.15, clearProps: 'all' },
    )

    gsap.fromTo('.timeline-spine',
      { scaleY: 0 },
      {
        scaleY: 1,
        transformOrigin: 'top center',
        ease: 'none',
        scrollTrigger: { trigger: timelineEl.value, start: 'top 80%', end: 'bottom 20%', scrub: 1 },
      },
    )

  }, sectionEl.value!)
})

onUnmounted(() => {
  gsapCtx?.revert()
  ScrollTrigger.getAll().forEach((t) => t.kill())
})
</script>

<style scoped>
.about-section {
  position: relative;
  padding: 120px 0 100px;
  background: var(--bg-base);
  overflow: hidden;
}

.about-section::before {
  content: '';
  position: absolute;
  top: 10%;
  right: -200px;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 5%, transparent) 0%, transparent 70%);
  pointer-events: none;
}

.section-label {
  max-width: 1280px;
  margin: 0 auto 56px;
  padding: 0 24px;
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

.about-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 64px;
}

@media (min-width: 1024px) {
  .about-inner {
    grid-template-columns: 1.1fr 0.9fr;
    gap: 80px;
    align-items: start;
  }
}

.about-story {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.about-heading {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--text-primary);
}

.heading-accent {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.story-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.story-body p {
  font-size: 16px;
  line-height: 1.85;
  color: var(--text-secondary);
  max-width: 62ch;
}

.story-body p:first-child {
  font-size: 17px;
  color: var(--text-secondary);
}

.signature-block {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 8px;
}

.signature-line {
  width: 48px;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), transparent);
  flex-shrink: 0;
}

.signature-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.signature-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.signature-title {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.04em;
}

.about-aside {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 1024px) {
  .about-aside {
    position: sticky;
    top: 88px;
  }
}

.philosophy-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 480px) {
  .philosophy-grid { grid-template-columns: 1fr; }
}

.philosophy-card {
  padding: 20px;
  border-radius: 14px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-primary);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.3s, background-color 0.3s, transform 0.3s;
  cursor: default;
}

.philosophy-card:hover {
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
  background: color-mix(in srgb, var(--color-primary) 5%, var(--bg-primary));
  transform: translateY(-3px);
}

.card-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-primary-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.card-icon {
  font-size: 16px;
  color: var(--color-primary);
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.card-body {
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--text-tertiary);
}

.stack-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stack-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  font-family: 'Geist Mono', monospace;
}

.stack-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stack-pill {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Geist Mono', monospace;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  background: var(--bg-primary);
  transition: border-color 0.2s, color 0.2s, background-color 0.2s;
  cursor: default;
}

.stack-pill:hover {
  border-color: var(--pill-color, var(--color-primary));
  color: var(--pill-color, var(--color-primary));
  background: color-mix(in srgb, var(--pill-color, var(--color-primary)) 8%, transparent);
}

.meta-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-primary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: 'Geist Mono', monospace;
}

.meta-icon {
  font-size: 12px;
  color: var(--text-disabled);
}

.meta-divider {
  width: 1px;
  height: 14px;
  background: var(--border-active);
}

.avail-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-success);
  animation: pulseDot 2s ease-in-out infinite;
  flex-shrink: 0;
}

.avail-text { color: var(--color-success); }

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}

.timeline {
  position: relative;
  max-width: 1280px;
  margin: 80px auto 0;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

@media (min-width: 768px) {
  .timeline { grid-template-columns: 1fr 1fr; }
}

.timeline-spine {
  display: none;
}

@media (min-width: 768px) {
  .timeline-spine {
    display: block;
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, transparent, var(--border-active) 10%, var(--border-active) 90%, transparent);
    transform: translateX(-50%);
    transform-origin: top center;
  }
}

.timeline-item {
  position: relative;
  padding: 0 0 40px 0;
}

@media (min-width: 768px) {
  .timeline-item {
    padding: 0 48px 64px 0;
    text-align: right;
  }

  .timeline-item--right {
    padding: 0 0 64px 48px;
    text-align: left;
    grid-column: 2;
    margin-top: -40px;
  }
}

.timeline-dot {
  display: none;
}

@media (min-width: 768px) {
  .timeline-dot {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: -8px;
    top: 6px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid var(--color-primary);
    background: var(--bg-base);
    z-index: 1;
  }

  .timeline-item--right .timeline-dot {
    right: auto;
    left: -8px;
  }
}

.timeline-dot__inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}

.timeline-card {
  padding: 20px 24px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-primary);
  transition: border-color 0.3s, background-color 0.3s;
}

.timeline-card:hover {
  border-color: color-mix(in srgb, var(--color-primary) 25%, transparent);
  background: color-mix(in srgb, var(--color-primary) 4%, var(--bg-primary));
}

.timeline-year {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--color-primary);
  font-family: 'Geist Mono', monospace;
  text-transform: uppercase;
}

.timeline-role {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 6px 0 2px;
  letter-spacing: -0.01em;
}

.timeline-company {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: 'Geist Mono', monospace;
  margin-bottom: 10px;
}

.timeline-desc {
  font-size: 13px;
  line-height: 1.65;
  color: var(--text-tertiary);
}
</style>
