<template>
  <section
    id="services"
    ref="sectionEl"
    class="svc-section"
    aria-label="Services"
  >
    <!-- Background -->
    <div
      class="svc-section__bg"
      aria-hidden="true"
    >
      <div class="svc-bg-orb svc-bg-orb--1" />
      <div class="svc-bg-orb svc-bg-orb--2" />
      <div class="svc-bg-orb svc-bg-orb--3" />
    </div>

    <!-- Header -->
    <div class="svc-section__header">
      <div
        ref="labelEl"
        class="svc-section__label"
      >
        <span class="svc-label-line" />
        <span class="svc-label-text">{{ t('services.label') }}</span>
      </div>

      <h2
        ref="headingEl"
        class="svc-section__heading"
      >
        {{ t('services.heading') }}<br />
        <span class="svc-heading-accent">{{ t('services.headingAccent') }}</span>
      </h2>

      <p
        ref="subEl"
        class="svc-section__sub"
      >
        {{ t('services.sub') }}
      </p>

      <!-- Availability strip -->
      <div
        ref="availEl"
        class="svc-section__avail"
      >
        <span
          class="svc-avail-dot"
          aria-hidden="true"
        />
        <span class="svc-avail-text">{{ APP_AVAILABILITY_TEXT }}</span>
        <span
          class="svc-avail-sep"
          aria-hidden="true"
        >·</span>
        <span class="svc-avail-location">{{ APP_LOCATION }}</span>
        <span
          class="svc-avail-sep"
          aria-hidden="true"
        >·</span>
        <span class="svc-avail-remote">{{ t('common.misc.remoteWorldwide') }}</span>
      </div>
    </div>

    <!-- Cards grid -->
    <div
      ref="gridEl"
      class="svc-section__grid-wrap"
    >
      <div class="svc-section__grid">
        <ServiceCard
          v-for="(service, i) in SERVICES"
          :key="service.id"
          :service="service"
          :index="i"
          class="svc-grid-card"
        />
      </div>
    </div>

    <!-- CTA strip -->
    <div
      ref="ctaEl"
      class="svc-section__cta"
    >
      <div class="svc-cta-panel">
        <div class="svc-cta-panel__left">
          <div class="svc-cta-panel__eyebrow">
            <span
              class="svc-avail-dot"
              aria-hidden="true"
            />
            <span>{{ t('common.misc.openToNewWork') }}</span>
          </div>
          <h3 class="svc-cta-panel__heading">{{ t('services.cta.heading') }}</h3>
          <p class="svc-cta-panel__sub">{{ t('services.cta.sub') }}</p>
        </div>

        <div class="svc-cta-panel__right">
          <a
            href="/#contact"
            class="svc-cta-btn svc-cta-btn--primary"
          >
            <i class="pi pi-send" />
            <span>{{ t('common.cta.startConvo') }}</span>
          </a>
          <a
            :href="`mailto:${APP_EMAIL}`"
            class="svc-cta-btn svc-cta-btn--secondary"
          >
            <i class="pi pi-envelope" />
            <span>{{ t('common.cta.emailDirect') }}</span>
          </a>
          <div class="svc-cta-panel__response">
            <i
              class="pi pi-clock"
              style="font-size:11px; color:#555;"
            />
            <span>{{ t('services.cta.response') }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'
import { SERVICES } from '@/constants/services.constants'
import { APP_EMAIL, APP_AVAILABILITY_TEXT, APP_LOCATION } from '@/constants/app.constants'
import ServiceCard from './ServiceCard.vue'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()

const sectionEl = ref<HTMLElement | null>(null)
const labelEl   = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const subEl     = ref<HTMLElement | null>(null)
const availEl   = ref<HTMLElement | null>(null)
const gridEl    = ref<HTMLElement | null>(null)
const ctaEl     = ref<HTMLElement | null>(null)

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
    gsap.fromTo(availEl.value,
      { opacity: 0, y: 16 },
      { scrollTrigger: { trigger: availEl.value, start: 'top 90%', once: true },
        opacity: 1, y: 0, duration: 0.5, ease, delay: 0.15, clearProps: 'all' },
    )
    gsap.fromTo('.svc-grid-card',
      { opacity: 0, y: 48, scale: 0.96 },
      { scrollTrigger: { trigger: gridEl.value, start: 'top 82%', once: true },
        opacity: 1, y: 0, scale: 1, duration: 0.7, ease, stagger: 0.07, clearProps: 'all' },
    )
    gsap.fromTo(ctaEl.value,
      { opacity: 0, y: 32 },
      { scrollTrigger: { trigger: ctaEl.value, start: 'top 88%', once: true },
        opacity: 1, y: 0, duration: 0.7, ease, clearProps: 'all' },
    )
  }, sectionEl.value!)
})

onUnmounted(() => gsapCtx?.revert())
</script>

<style scoped>
/* ── Section shell ─────────────────────────────────────────────── */
.svc-section {
  position: relative;
  padding: 120px 0 100px;
  background: #080808;
  overflow: hidden;
}

/* ── Background orbs ───────────────────────────────────────────── */
.svc-section__bg { position: absolute; inset: 0; pointer-events: none; }

.svc-bg-orb {
  position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none;
}
.svc-bg-orb--1 {
  width: 600px; height: 600px; top: -150px; right: -100px;
  background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
  animation: svcOrb1 14s ease-in-out infinite;
}
.svc-bg-orb--2 {
  width: 500px; height: 500px; bottom: 0; left: -100px;
  background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
  animation: svcOrb2 18s ease-in-out infinite;
}
.svc-bg-orb--3 {
  width: 400px; height: 400px; top: 40%; left: 40%;
  background: radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%);
  animation: svcOrb1 22s ease-in-out infinite reverse;
}
@keyframes svcOrb1 {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(40px, -50px); }
}
@keyframes svcOrb2 {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(-30px, 40px); }
}

/* ── Header ────────────────────────────────────────────────────── */
.svc-section__header {
  max-width: 1280px; margin: 0 auto; padding: 0 24px;
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; text-align: center; margin-bottom: 64px;
}

.svc-section__label { display: flex; align-items: center; gap: 16px; }
.svc-label-line { display: block; width: 40px; height: 1px; background: #6366f1; flex-shrink: 0; }
.svc-label-text {
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: #6366f1; font-family: 'Geist Mono', monospace;
}

.svc-section__heading {
  font-size: clamp(32px, 4vw, 56px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.1; color: #f5f5f5;
}
.svc-heading-accent {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.svc-section__sub {
  font-size: 16px; line-height: 1.7; color: #737373; max-width: 500px;
}

/* Availability strip */
.svc-section__avail {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center;
  padding: 10px 20px; border-radius: 100px;
  border: 1px solid rgba(16,185,129,0.2); background: rgba(16,185,129,0.05);
}
.svc-avail-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #10b981; flex-shrink: 0;
  box-shadow: 0 0 8px rgba(16,185,129,0.6);
  animation: availPulse 2s ease-in-out infinite;
}
@keyframes availPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(16,185,129,0.6); }
  50%       { box-shadow: 0 0 14px rgba(16,185,129,0.9); }
}
.svc-avail-text  { font-size: 13px; font-weight: 600; color: #10b981; }
.svc-avail-sep   { color: #333; font-size: 12px; }
.svc-avail-location,
.svc-avail-remote { font-size: 12px; font-family: 'Geist Mono', monospace; color: #555; }

/* ── Grid ──────────────────────────────────────────────────────── */
.svc-section__grid-wrap { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

.svc-section__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: start;
}
@media (min-width: 640px)  { .svc-section__grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .svc-section__grid { grid-template-columns: repeat(3, 1fr); } }

/* ── CTA strip ─────────────────────────────────────────────────── */
.svc-section__cta {
  max-width: 1280px; margin: 64px auto 0; padding: 0 24px;
}

.svc-cta-panel {
  border-radius: 24px;
  border: 1px solid rgba(99,102,241,0.15);
  background: rgba(17,17,17,0.9);
  backdrop-filter: blur(20px);
  padding: 48px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  position: relative;
  overflow: hidden;
}
@media (min-width: 768px) { .svc-cta-panel { grid-template-columns: 1fr auto; align-items: center; } }

/* Gradient glow behind CTA panel */
.svc-cta-panel::before {
  content: '';
  position: absolute; inset: 0; border-radius: 24px; pointer-events: none;
  background: radial-gradient(ellipse 60% 80% at 0% 50%, rgba(99,102,241,0.08) 0%, transparent 70%);
}

.svc-cta-panel__eyebrow {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; font-family: 'Geist Mono', monospace;
  color: #10b981; letter-spacing: 0.06em; text-transform: uppercase;
  margin-bottom: 14px;
}

.svc-cta-panel__heading {
  font-size: clamp(22px, 3vw, 32px); font-weight: 800;
  letter-spacing: -0.03em; color: #f5f5f5; line-height: 1.2; margin-bottom: 12px;
}

.svc-cta-panel__sub {
  font-size: 15px; line-height: 1.75; color: #737373; max-width: 52ch;
}

.svc-cta-panel__right {
  display: flex; flex-direction: column; gap: 12px; flex-shrink: 0; min-width: 220px;
}

.svc-cta-btn {
  display: flex; align-items: center; justify-content: center; gap: 9px;
  padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 600;
  text-decoration: none; letter-spacing: 0.02em; transition: all 0.25s;
}

.svc-cta-btn--primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,0.35);
}
.svc-cta-btn--primary:hover {
  box-shadow: 0 8px 32px rgba(99,102,241,0.55); transform: translateY(-2px);
}

.svc-cta-btn--secondary {
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
  color: #a0a0a0;
}
.svc-cta-btn--secondary:hover {
  border-color: rgba(99,102,241,0.3); color: #e5e5e5;
  background: rgba(99,102,241,0.06);
}

.svc-cta-panel__response {
  display: flex; align-items: center; gap: 6px; justify-content: center;
  font-size: 11px; font-family: 'Geist Mono', monospace; color: #555;
}
</style>
