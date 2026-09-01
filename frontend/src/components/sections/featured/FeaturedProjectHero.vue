<template>
  <div
    ref="heroEl"
    class="fp-hero"
  >
    <!-- Animated background -->
    <div
      class="fp-hero__bg"
      aria-hidden="true"
    >
      <div class="fp-hero__bg-grid" />
      <div class="fp-hero__orb fp-hero__orb--1" />
      <div class="fp-hero__orb fp-hero__orb--2" />
      <div class="fp-hero__orb fp-hero__orb--3" />
    </div>

    <div class="fp-hero__inner">
      <!-- Left: copy -->
      <div class="fp-hero__copy">
        <div
          ref="badgeEl"
          class="fp-hero__badge-row"
        >
          <span
            class="fp-hero__status-dot"
            aria-hidden="true"
          />
          <span class="fp-hero__status">{{ featured.project.status }}</span>
          <span
            class="fp-hero__sep"
            aria-hidden="true"
          >·</span>
          <span class="fp-hero__meta-text">{{ featured.project.year }}</span>
          <span
            class="fp-hero__sep"
            aria-hidden="true"
          >·</span>
          <span class="fp-hero__meta-text">{{ featured.project.duration }}</span>
        </div>

        <div class="fp-hero__type-badge">
          <i :class="featured.icon" />
          {{ featured.project.type }}
        </div>

        <h1
          ref="titleEl"
          class="fp-hero__title"
        >
          {{ featured.project.title }}
        </h1>

        <p
          ref="taglineEl"
          class="fp-hero__tagline"
        >
          {{ featured.project.tagline }}
        </p>
        <p
          ref="descEl"
          class="fp-hero__desc"
        >
          {{ featured.project.description }}
        </p>

        <div
          ref="metaEl"
          class="fp-hero__meta"
        >
          <div class="fp-hero__meta-item">
            <i class="pi pi-user" />
            <span>{{ featured.project.role }}</span>
          </div>
        </div>

        <div
          ref="techEl"
          class="fp-hero__tech"
        >
          <span
            v-for="t in heroTech"
            :key="t.name"
            class="fp-hero__tech-pill"
            :style="{ '--tc': t.color }"
          >{{ t.name }}</span>
        </div>

        <!-- Live link -->
        <div class="fp-hero__actions">
          <a
            :href="featured.project.liveUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="fp-hero__live-btn"
            :style="{ '--pc': featured.color }"
          >
            <i class="pi pi-external-link" />
            View Live
          </a>
        </div>
      </div>

      <!-- Right: architecture diagram -->
      <div
        ref="diagramEl"
        class="fp-hero__diagram"
      >
        <div class="fp-diagram">
          <div class="fp-diagram__bar">
            <span class="fp-diagram__dot fp-diagram__dot--r" />
            <span class="fp-diagram__dot fp-diagram__dot--y" />
            <span class="fp-diagram__dot fp-diagram__dot--g" />
            <span class="fp-diagram__url">{{ diagramUrl }}</span>
          </div>

          <div class="fp-diagram__body">
            <div
              v-for="layer in diagramLayers"
              :key="layer.label"
            >
              <div
                class="fp-diagram__layer"
                :class="`fp-diagram__layer--${layer.variant}`"
              >
                <span class="fp-diagram__layer-label">{{ layer.label }}</span>
                <div class="fp-diagram__nodes">
                  <div
                    v-for="node in layer.nodes"
                    :key="node.label"
                    class="fp-diagram__node"
                    :class="`fp-diagram__node--${node.variant}`"
                  >
                    <i :class="node.icon" /><span>{{ node.label }}</span>
                  </div>
                </div>
              </div>
              <div
                v-if="layer.arrow"
                class="fp-diagram__arrow"
                aria-hidden="true"
              >
                <div class="fp-diagram__arrow-line" />
                <i class="pi pi-arrow-down fp-diagram__arrow-icon" />
              </div>
            </div>
          </div>

          <!-- Animated data flow pulses -->
          <div
            class="fp-diagram__pulses"
            aria-hidden="true"
          >
            <div class="fp-diagram__pulse fp-diagram__pulse--1" />
            <div class="fp-diagram__pulse fp-diagram__pulse--2" />
            <div class="fp-diagram__pulse fp-diagram__pulse--3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Metrics strip -->
    <div
      ref="metricsEl"
      class="fp-hero__metrics"
    >
      <div
        v-for="m in featured.metrics"
        :key="m.label"
        class="fp-hero__metric"
        :title="m.description"
      >
        <span class="fp-hero__metric-value">{{ m.value }}</span>
        <span class="fp-hero__metric-label">{{ m.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'
import type { FeaturedProject } from '@/constants/featured-project.constants'

const props = defineProps<{ featured: FeaturedProject }>()

const heroTech = computed(() => [...props.featured.tech].slice(0, 8))

const diagramUrl = computed(() =>
  props.featured.key === 'careerforge'
    ? 'careerforge.yashranjan.com'
    : 'eams-frontend.onrender.com'
)

const diagramLayers = computed(() => {
  if (props.featured.key === 'careerforge') {
    return [
      { label: 'Frontend', variant: 'client', arrow: true, nodes: [
        { label: 'Vue 3 + Vite', variant: 'vue',    icon: 'pi pi-desktop'     },
        { label: 'Nginx',        variant: 'mobile',  icon: 'pi pi-server'      },
      ]},
      { label: 'Backend', variant: 'api', arrow: true, nodes: [
        { label: 'Spring Boot',  variant: 'spring',  icon: 'pi pi-server'      },
        { label: 'Stripe',       variant: 'alb',     icon: 'pi pi-credit-card' },
      ]},
      { label: 'Data', variant: 'data', arrow: false, nodes: [
        { label: 'PostgreSQL',   variant: 'pg',      icon: 'pi pi-database'    },
        { label: 'OpenPDF',      variant: 'redis',   icon: 'pi pi-file-pdf'    },
      ]},
    ]
  }
  return [
    { label: 'Frontend', variant: 'client', arrow: true, nodes: [
      { label: 'Vue.js 3',     variant: 'vue',    icon: 'pi pi-desktop'  },
      { label: 'PrimeVue 4',   variant: 'mobile', icon: 'pi pi-th-large' },
    ]},
    { label: 'Backend', variant: 'api', arrow: true, nodes: [
      { label: 'Spring Boot',  variant: 'spring', icon: 'pi pi-server'   },
      { label: 'Jenkins CI',   variant: 'alb',    icon: 'pi pi-cog'      },
    ]},
    { label: 'Data', variant: 'data', arrow: false, nodes: [
      { label: 'PostgreSQL',   variant: 'pg',     icon: 'pi pi-database' },
      { label: 'SonarQube',    variant: 'redis',  icon: 'pi pi-shield'   },
    ]},
  ]
})

const heroEl    = ref<HTMLElement | null>(null)
const badgeEl   = ref<HTMLElement | null>(null)
const titleEl   = ref<HTMLElement | null>(null)
const taglineEl = ref<HTMLElement | null>(null)
const descEl    = ref<HTMLElement | null>(null)
const metaEl    = ref<HTMLElement | null>(null)
const techEl    = ref<HTMLElement | null>(null)
const diagramEl = ref<HTMLElement | null>(null)
const metricsEl = ref<HTMLElement | null>(null)

let gsapCtx: ReturnType<typeof gsap.context> | null = null

onMounted(() => {
  gsapCtx = gsap.context(() => {
    const ease = 'power3.out'
    const tl = gsap.timeline({ defaults: { ease, duration: 0.7 } })

    tl.fromTo(badgeEl.value,   { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, clearProps: 'all' })
      .fromTo(titleEl.value,   { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, clearProps: 'all' }, '-=0.3')
      .fromTo(taglineEl.value, { opacity: 0, y: 24 }, { opacity: 1, y: 0, clearProps: 'all' }, '-=0.5')
      .fromTo(descEl.value,    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, clearProps: 'all' }, '-=0.4')
      .fromTo(metaEl.value,    { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, clearProps: 'all' }, '-=0.4')
      .fromTo(techEl.value!.querySelectorAll('.fp-hero__tech-pill'),
        { opacity: 0, y: 12, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.05, duration: 0.4, clearProps: 'all' }, '-=0.3')
      .fromTo(diagramEl.value, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1, ease: 'power2.out', clearProps: 'all' }, '-=0.8')
      .fromTo(metricsEl.value!.querySelectorAll('.fp-hero__metric'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, stagger: 0.07, duration: 0.5, clearProps: 'all' }, '-=0.4')

    gsap.fromTo('.fp-diagram__layer',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease, delay: 0.8, clearProps: 'all' },
    )
    gsap.fromTo('.fp-diagram__arrow',
      { opacity: 0, scaleY: 0 },
      { opacity: 1, scaleY: 1, stagger: 0.15, duration: 0.4, ease,
        delay: 1.1, transformOrigin: 'top center', clearProps: 'all' },
    )
  }, heroEl.value!)
})

onUnmounted(() => gsapCtx?.revert())
</script>

<style scoped>
.fp-hero {
  position: relative;
  padding: 60px 0 0;
  overflow: hidden;
  background: #0a0a0a;
}

/* ── Background ────────────────────────────────────────────────── */
.fp-hero__bg { position: absolute; inset: 0; pointer-events: none; }

.fp-hero__bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
}

.fp-hero__orb {
  position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none;
}
.fp-hero__orb--1 {
  width: 600px; height: 600px; top: -200px; left: -100px;
  background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
  animation: orbFloat1 12s ease-in-out infinite;
}
.fp-hero__orb--2 {
  width: 500px; height: 500px; top: 0; right: -100px;
  background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
  animation: orbFloat2 15s ease-in-out infinite;
}
.fp-hero__orb--3 {
  width: 400px; height: 400px; bottom: 100px; left: 40%;
  background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
  animation: orbFloat1 18s ease-in-out infinite reverse;
}
@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(30px, -40px); }
}
@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(-20px, 30px); }
}

/* ── Inner layout ──────────────────────────────────────────────── */
.fp-hero__inner {
  max-width: 1280px; margin: 0 auto; padding: 0 24px 80px;
  display: grid; grid-template-columns: 1fr; gap: 64px; align-items: center;
}
@media (min-width: 1024px) { .fp-hero__inner { grid-template-columns: 1fr 1fr; } }

/* ── Copy ──────────────────────────────────────────────────────── */
.fp-hero__copy { display: flex; flex-direction: column; gap: 20px; }

.fp-hero__badge-row {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}

.fp-hero__status-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #10b981; flex-shrink: 0;
  box-shadow: 0 0 8px rgba(16,185,129,0.6);
  animation: pulseDot 2s ease-in-out infinite;
}
@keyframes pulseDot {
  0%, 100% { box-shadow: 0 0 8px rgba(16,185,129,0.6); }
  50%       { box-shadow: 0 0 16px rgba(16,185,129,0.9); }
}

.fp-hero__status {
  font-size: 12px; font-weight: 600; font-family: 'Geist Mono', monospace;
  color: #10b981; letter-spacing: 0.06em; text-transform: uppercase;
}
.fp-hero__sep { color: #333; font-size: 12px; }
.fp-hero__meta-text { font-size: 12px; font-family: 'Geist Mono', monospace; color: #555; letter-spacing: 0.04em; }

.fp-hero__type-badge {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 11px; font-weight: 600; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: #6366f1; background: rgba(99,102,241,0.08);
  border: 1px solid rgba(99,102,241,0.2); padding: 5px 12px; border-radius: 6px;
  width: fit-content;
}
.fp-hero__type-badge i { font-size: 11px; }

.fp-hero__title {
  font-size: clamp(28px, 4vw, 56px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.05; color: #f5f5f5;
}

.fp-hero__tagline {
  font-size: clamp(15px, 1.8vw, 19px); font-weight: 500;
  color: #a0a0a0; line-height: 1.5; letter-spacing: -0.01em;
}
.fp-hero__desc { font-size: 15px; line-height: 1.8; color: #737373; max-width: 56ch; }

.fp-hero__meta { display: flex; flex-wrap: wrap; gap: 20px; }
.fp-hero__meta-item {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #737373; font-family: 'Geist Mono', monospace;
}
.fp-hero__meta-item i { color: #6366f1; font-size: 13px; }

.fp-hero__tech { display: flex; flex-wrap: wrap; gap: 8px; }
.fp-hero__tech-pill {
  padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 600;
  font-family: 'Geist Mono', monospace; letter-spacing: 0.04em;
  border: 1px solid color-mix(in srgb, var(--tc, #6366f1) 25%, transparent);
  color: color-mix(in srgb, var(--tc, #6366f1) 80%, #a0a0a0);
  background: color-mix(in srgb, var(--tc, #6366f1) 8%, transparent);
  transition: border-color 0.2s, background 0.2s;
}
.fp-hero__tech-pill:hover {
  border-color: color-mix(in srgb, var(--tc, #6366f1) 50%, transparent);
  background: color-mix(in srgb, var(--tc, #6366f1) 14%, transparent);
}

/* ── Live button ───────────────────────────────────────────────── */
.fp-hero__actions { display: flex; gap: 12px; flex-wrap: wrap; }

.fp-hero__live-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 24px; border-radius: 10px; font-size: 14px; font-weight: 600;
  text-decoration: none; transition: all 0.2s;
  background: color-mix(in srgb, var(--pc, #6366f1) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--pc, #6366f1) 40%, transparent);
  color: color-mix(in srgb, var(--pc, #6366f1) 90%, #fff);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--pc, #6366f1) 15%, transparent);
}
.fp-hero__live-btn:hover {
  background: color-mix(in srgb, var(--pc, #6366f1) 25%, transparent);
  box-shadow: 0 6px 24px color-mix(in srgb, var(--pc, #6366f1) 30%, transparent);
  transform: translateY(-1px);
}
.fp-hero__live-btn i { font-size: 12px; }

/* ── Architecture diagram ──────────────────────────────────────── */
.fp-hero__diagram { display: flex; justify-content: center; }

.fp-diagram {
  position: relative; width: 100%; max-width: 480px;
  border-radius: 16px; border: 1px solid rgba(255,255,255,0.07);
  background: rgba(17,17,17,0.92); backdrop-filter: blur(20px);
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1);
}

.fp-diagram__bar {
  display: flex; align-items: center; gap: 6px; padding: 10px 14px;
  background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05);
}
.fp-diagram__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.fp-diagram__dot--r { background: #ff5f57; }
.fp-diagram__dot--y { background: #febc2e; }
.fp-diagram__dot--g { background: #28c840; }
.fp-diagram__url {
  font-size: 10px; font-family: 'Geist Mono', monospace;
  color: #444; margin-left: 8px; letter-spacing: 0.04em;
}

.fp-diagram__body { padding: 20px 16px 24px; display: flex; flex-direction: column; }

.fp-diagram__layer {
  border-radius: 10px; padding: 12px 14px; border: 1px solid rgba(255,255,255,0.05);
}
.fp-diagram__layer--client { background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.15); }
.fp-diagram__layer--api    { background: rgba(16,185,129,0.05); border-color: rgba(16,185,129,0.12); }
.fp-diagram__layer--data   { background: rgba(245,158,11,0.05); border-color: rgba(245,158,11,0.12); }

.fp-diagram__layer-label {
  font-size: 9px; font-weight: 700; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.1em; text-transform: uppercase; color: #555;
  display: block; margin-bottom: 10px;
}

.fp-diagram__nodes { display: flex; gap: 8px; flex-wrap: wrap; }

.fp-diagram__node {
  display: flex; align-items: center; gap: 6px; padding: 6px 10px;
  border-radius: 7px; font-size: 10px; font-weight: 600;
  font-family: 'Geist Mono', monospace; border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03); color: #a0a0a0; white-space: nowrap;
}
.fp-diagram__node i { font-size: 10px; }
.fp-diagram__node--vue    { color: #42b883; border-color: rgba(66,184,131,0.2); }
.fp-diagram__node--mobile { color: #6366f1; border-color: rgba(99,102,241,0.2); }
.fp-diagram__node--alb    { color: #ff9900; border-color: rgba(255,153,0,0.2);  }
.fp-diagram__node--spring { color: #6db33f; border-color: rgba(109,179,63,0.2); }
.fp-diagram__node--pg     { color: #336791; border-color: rgba(51,103,145,0.2); }
.fp-diagram__node--redis  { color: #dc382d; border-color: rgba(220,56,45,0.2);  }

.fp-diagram__arrow {
  display: flex; flex-direction: column; align-items: center; padding: 4px 0;
}
.fp-diagram__arrow-line {
  width: 1px; height: 16px;
  background: linear-gradient(to bottom, rgba(99,102,241,0.4), rgba(99,102,241,0.1));
}
.fp-diagram__arrow-icon { font-size: 8px; color: rgba(99,102,241,0.5); margin-top: -2px; }

/* Animated data flow pulses */
.fp-diagram__pulses { position: absolute; inset: 0; pointer-events: none; }
.fp-diagram__pulse {
  position: absolute; left: 50%; width: 6px; height: 6px;
  border-radius: 50%; background: #6366f1; transform: translateX(-50%); opacity: 0;
}
.fp-diagram__pulse--1 { top: 30%; animation: pulseDrop 3s ease-in-out 0s infinite; }
.fp-diagram__pulse--2 { top: 30%; animation: pulseDrop 3s ease-in-out 1s infinite; }
.fp-diagram__pulse--3 { top: 30%; animation: pulseDrop 3s ease-in-out 2s infinite; }
@keyframes pulseDrop {
  0%   { opacity: 0; top: 28%; }
  20%  { opacity: 0.8; }
  80%  { opacity: 0.4; top: 72%; }
  100% { opacity: 0; top: 72%; }
}

/* ── Metrics strip ─────────────────────────────────────────────── */
.fp-hero__metrics {
  max-width: 1280px; margin: 0 auto; padding: 0 24px;
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 1px; background: #1a1a1a; border-top: 1px solid #1a1a1a;
}
@media (min-width: 640px)  { .fp-hero__metrics { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .fp-hero__metrics { grid-template-columns: repeat(6, 1fr); } }

.fp-hero__metric {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 28px 16px; background: #0a0a0a; cursor: default; transition: background 0.2s;
}
.fp-hero__metric:hover { background: #111; }

.fp-hero__metric-value {
  font-size: 22px; font-weight: 800; letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums; line-height: 1;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.fp-hero__metric-label {
  font-size: 10px; font-family: 'Geist Mono', monospace; color: #555;
  letter-spacing: 0.06em; text-transform: uppercase; text-align: center; line-height: 1.4;
}
</style>
