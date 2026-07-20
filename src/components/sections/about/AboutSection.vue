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
      <span class="label-text">About</span>
    </div>

    <div class="about-inner">
      <!-- ══ LEFT — Story ══════════════════════════════════════ -->
      <div class="about-story">
        <h2
          ref="headingEl"
          class="about-heading"
        >
          I don't just write code.<br />
          <span class="heading-accent">I engineer outcomes.</span>
        </h2>

        <div
          ref="storyEl"
          class="story-body"
        >
          <p>
            Seven years ago I joined a fintech startup as the only backend engineer.
            No playbook, no senior to ask — just a production system that needed to
            handle real money for real people without falling over. That pressure
            taught me something no course ever could: the difference between code
            that works in a demo and code that works at 3 AM when the on-call phone
            rings.
          </p>
          <p>
            Since then I've built and shipped enterprise systems across banking,
            logistics, and SaaS — things like a payment reconciliation engine
            processing ₹40 Cr daily, a multi-tenant Spring Boot platform serving
            12 enterprise clients, and a CI/CD pipeline that cut deployment time
            from 4 hours to 18 minutes. The stack changes. The discipline doesn't.
          </p>
          <p>
            My approach is boring in the best way: understand the domain first,
            model it correctly, then pick the simplest technology that survives
            production. I've seen too many projects collapse under clever
            abstractions that nobody could debug at midnight. I'd rather write
            code my future self can read than code that impresses in a code review.
          </p>
          <p>
            Lately I've been integrating AI tooling — not as a gimmick, but as a
            force multiplier. LLM-assisted code generation, intelligent search
            over internal knowledge bases, automated anomaly detection in data
            pipelines. The goal is always the same: ship more value with less
            friction, and make the system easier to reason about, not harder.
          </p>
        </div>

        <!-- Signature -->
        <div
          ref="signatureEl"
          class="signature-block"
        >
          <div class="signature-line" />
          <div class="signature-meta">
            <span class="signature-name">{{ APP_NAME }}</span>
            <span class="signature-title">Enterprise Software & AI Consultant · {{ APP_YEARS_EXPERIENCE }}+ yrs</span>
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
            :key="card.title"
            class="philosophy-card"
          >
            <div class="card-icon-wrap">
              <i
                :class="card.icon"
                class="card-icon"
              />
            </div>
            <h3 class="card-title">
              {{ card.title }}
            </h3>
            <p class="card-body">
              {{ card.body }}
            </p>
          </div>
        </div>

        <!-- Currently working with -->
        <div
          ref="stackEl"
          class="stack-block"
        >
          <p class="stack-label">
            Currently working with
          </p>
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
            <span>Responds in {{ APP_RESPONSE_TIME }}</span>
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
        v-for="(item, i) in TIMELINE"
        :key="item.year"
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
          <span class="timeline-year">{{ item.year }}</span>
          <h4 class="timeline-role">
            {{ item.role }}
          </h4>
          <p class="timeline-company">
            {{ item.company }}
          </p>
          <p class="timeline-desc">
            {{ item.desc }}
          </p>
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

const PHILOSOPHY = [
  {
    icon: 'pi pi-server',
    title: 'Systems over features',
    body: 'A feature ships once. The system it lives in runs forever. I design for operability first — observability, failure modes, and rollback before the first line of business logic.',
  },
  {
    icon: 'pi pi-bolt',
    title: 'Boring is a compliment',
    body: 'Postgres, Spring Boot, Redis, S3. Proven tools with known failure modes beat novel ones with unknown edges. I reach for new tech when the problem genuinely demands it.',
  },
  {
    icon: 'pi pi-sitemap',
    title: 'Domain before architecture',
    body: "The biggest source of complexity in enterprise software isn't the tech — it's a misunderstood domain. I spend time with stakeholders before I open an IDE.",
  },
  {
    icon: 'pi pi-sparkles',
    title: 'AI as a multiplier',
    body: "I use LLMs to accelerate the parts of engineering that don't require judgment — boilerplate, test generation, documentation. The judgment stays human.",
  },
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

const TIMELINE = [
  {
    year: '2017',
    role: 'Junior Backend Engineer',
    company: 'Fintech Startup',
    desc: 'First production system. Learned that uptime is a feature and that nobody reads the runbook until 2 AM.',
  },
  {
    year: '2019',
    role: 'Software Engineer',
    company: 'Enterprise SaaS',
    desc: 'Migrated a monolith to modular services. Reduced p99 latency by 60% through query optimization and caching strategy.',
  },
  {
    year: '2021',
    role: 'Senior Engineer',
    company: 'Logistics Platform',
    desc: 'Designed a real-time tracking pipeline on Kafka + AWS. Owned architecture decisions end-to-end for the first time.',
  },
  {
    year: '2023',
    role: 'Lead Engineer / Consultant',
    company: 'Independent',
    desc: 'Working directly with founders and CTOs. Shipping full-stack systems, cloud infrastructure, and AI-integrated backends.',
  },
] as const

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

    gsap.from(labelEl.value, {
      scrollTrigger: { trigger: labelEl.value, start: 'top 88%', once: true },
      opacity: 0, x: -24, duration: 0.6, ease,
    })

    gsap.from(headingEl.value, {
      scrollTrigger: { trigger: headingEl.value, start: 'top 85%', once: true },
      opacity: 0, y: 40, duration: 0.8, ease,
    })

    gsap.from(storyEl.value!.querySelectorAll('p'), {
      scrollTrigger: { trigger: storyEl.value, start: 'top 82%', once: true },
      opacity: 0, y: 28, duration: 0.7, ease, stagger: 0.14,
    })

    gsap.from(signatureEl.value, {
      scrollTrigger: { trigger: signatureEl.value, start: 'top 90%', once: true },
      opacity: 0, x: -20, duration: 0.6, ease, delay: 0.2,
    })

    gsap.from(cardsEl.value!.querySelectorAll('.philosophy-card'), {
      scrollTrigger: { trigger: cardsEl.value, start: 'top 82%', once: true },
      opacity: 0, y: 32, scale: 0.97, duration: 0.65, ease, stagger: 0.1,
    })

    gsap.from(stackEl.value!.querySelectorAll('.stack-pill'), {
      scrollTrigger: { trigger: stackEl.value, start: 'top 88%', once: true },
      opacity: 0, scale: 0.85, duration: 0.4, ease: 'back.out(1.4)', stagger: 0.05,
    })

    gsap.from(metaEl.value, {
      scrollTrigger: { trigger: metaEl.value, start: 'top 90%', once: true },
      opacity: 0, y: 16, duration: 0.5, ease,
    })

    gsap.from(timelineEl.value!.querySelectorAll('.timeline-item'), {
      scrollTrigger: { trigger: timelineEl.value, start: 'top 80%', once: true },
      opacity: 0, y: 40, duration: 0.7, ease, stagger: 0.15,
    })

    gsap.from('.timeline-spine', {
      scrollTrigger: {
        trigger: timelineEl.value,
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1,
      },
      scaleY: 0,
      transformOrigin: 'top center',
      ease: 'none',
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
.about-section {
  position: relative;
  padding: 120px 0 100px;
  background: #0a0a0a;
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
  background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%);
  pointer-events: none;
}

/* ── Section label ─────────────────────────────────────────────── */
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
  background: #6366f1;
  flex-shrink: 0;
}

.label-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6366f1;
  font-family: 'Geist Mono', monospace;
}

/* ── Two-column layout ─────────────────────────────────────────── */
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

/* ── Story ─────────────────────────────────────────────────────── */
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
  color: #f5f5f5;
}

.heading-accent {
  background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
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
  color: #a0a0a0;
  max-width: 62ch;
}

.story-body p:first-child {
  font-size: 17px;
  color: #c0c0c0;
}

/* ── Signature ─────────────────────────────────────────────────── */
.signature-block {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 8px;
}

.signature-line {
  width: 48px;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, transparent);
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
  color: #f5f5f5;
  letter-spacing: -0.01em;
}

.signature-title {
  font-size: 12px;
  color: #555555;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.04em;
}

/* ── Aside (sticky on desktop) ─────────────────────────────────── */
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

/* ── Philosophy cards ──────────────────────────────────────────── */
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
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.3s, background 0.3s, transform 0.3s;
  cursor: default;
}

.philosophy-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.05);
  transform: translateY(-3px);
}

.card-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.card-icon {
  font-size: 16px;
  color: #6366f1;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #f5f5f5;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.card-body {
  font-size: 12.5px;
  line-height: 1.65;
  color: #737373;
}

/* ── Tech stack ────────────────────────────────────────────────── */
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
  color: #555555;
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
  color: #a0a0a0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  cursor: default;
}

.stack-pill:hover {
  border-color: var(--pill-color, #6366f1);
  color: var(--pill-color, #6366f1);
  background: color-mix(in srgb, var(--pill-color, #6366f1) 8%, transparent);
}

/* ── Meta strip ────────────────────────────────────────────────── */
.meta-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid #1a1a1a;
  background: #111111;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #737373;
  font-family: 'Geist Mono', monospace;
}

.meta-icon {
  font-size: 12px;
  color: #555555;
}

.meta-divider {
  width: 1px;
  height: 14px;
  background: #2a2a2a;
}

.avail-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  animation: pulseDot 2s ease-in-out infinite;
  flex-shrink: 0;
}

.avail-text { color: #10b981; }

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}

/* ── Timeline ──────────────────────────────────────────────────── */
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
    background: linear-gradient(to bottom, transparent, #2a2a2a 10%, #2a2a2a 90%, transparent);
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
    border: 2px solid #6366f1;
    background: #0a0a0a;
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
  background: #6366f1;
}

.timeline-card {
  padding: 20px 24px;
  border-radius: 12px;
  border: 1px solid #1a1a1a;
  background: #111111;
  transition: border-color 0.3s, background 0.3s;
}

.timeline-card:hover {
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.04);
}

.timeline-year {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #6366f1;
  font-family: 'Geist Mono', monospace;
  text-transform: uppercase;
}

.timeline-role {
  font-size: 15px;
  font-weight: 600;
  color: #f5f5f5;
  margin: 6px 0 2px;
  letter-spacing: -0.01em;
}

.timeline-company {
  font-size: 12px;
  color: #555555;
  font-family: 'Geist Mono', monospace;
  margin-bottom: 10px;
}

.timeline-desc {
  font-size: 13px;
  line-height: 1.65;
  color: #737373;
}
</style>
