<template>
  <article
    ref="cardEl"
    class="proj-card"
    :class="{ 'proj-card--featured': project.featured, 'proj-card--expanded': isExpanded }"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @mouseenter="onMouseEnter"
  >
    <!-- Animated conic border -->
    <div
      class="proj-card__border"
      :style="borderStyle"
      aria-hidden="true"
    />
    <!-- Mouse-follow glow -->
    <div
      class="proj-card__glow"
      :style="glowStyle"
      aria-hidden="true"
    />

    <div class="proj-card__inner">
      <!-- ── Image / Visual area ─────────────────────────────── -->
      <div
        class="proj-card__visual"
        :style="visualStyle"
      >
        <!-- Gradient overlay -->
        <div
          class="proj-card__visual-overlay"
          :style="overlayStyle"
        />

        <!-- Floating mockup window -->
        <div
          class="proj-card__mockup"
          :class="{ 'proj-card__mockup--hovered': isHovered }"
        >
          <div class="mockup-bar">
            <span class="mockup-dot mockup-dot--red" />
            <span class="mockup-dot mockup-dot--yellow" />
            <span class="mockup-dot mockup-dot--green" />
            <span class="mockup-url">{{ project.slug }}.app</span>
          </div>
          <div class="mockup-body">
            <!-- Animated code lines -->
            <div
              v-for="n in 6"
              :key="n"
              class="mockup-line"
              :style="mockupLineStyle(n)"
            />
            <div
              class="mockup-block"
              :style="{ background: `${gradient.from}22` }"
            />
          </div>
        </div>

        <!-- Category badge -->
        <div
          class="proj-card__cat-badge"
          :style="{ color: catConfig.color, background: catConfig.bg }"
        >
          <i
            :class="catConfig.icon"
            style="font-size:10px;"
          />
          {{ catConfig.label }}
        </div>

        <!-- Year -->
        <span class="proj-card__year">{{ project.year }}</span>
      </div>

      <!-- ── Content ─────────────────────────────────────────── -->
      <div class="proj-card__content">
        <!-- Header -->
        <div class="proj-card__header">
          <div>
            <div class="proj-card__title-row">
              <h3 class="proj-card__title">
                {{ project.title }}
              </h3>
              <span
                v-if="project.featured"
                class="proj-card__featured-tag"
              >Featured</span>
            </div>
            <p class="proj-card__tagline">
              {{ project.tagline }}
            </p>
          </div>
          <div class="proj-card__meta-right">
            <span class="proj-card__duration">
              <i
                class="pi pi-clock"
                style="font-size:10px;"
              />
              {{ project.duration }}
            </span>
            <span class="proj-card__role-badge">{{ project.role }}</span>
          </div>
        </div>

        <!-- Description -->
        <p class="proj-card__desc">
          {{ project.description }}
        </p>

        <!-- Metrics row -->
        <div
          v-if="project.metrics?.length"
          class="proj-card__metrics"
        >
          <div
            v-for="m in project.metrics"
            :key="m.label"
            class="metric-item"
            :title="m.description"
          >
            <span
              class="metric-value"
              :style="{ color: gradient.from }"
            >{{ m.value }}</span>
            <span class="metric-label">{{ m.label }}</span>
          </div>
        </div>

        <!-- Tech badges -->
        <div
          class="proj-card__tech"
          aria-label="Technologies"
        >
          <span
            v-for="t in project.tech"
            :key="t.name"
            class="tech-badge"
            :style="t.color ? { '--tech-color': t.color } : {}"
          >{{ t.name }}</span>
        </div>

        <!-- Action row -->
        <div class="proj-card__actions">
          <div class="proj-card__links">
            <a
              v-for="link in project.links"
              :key="link.type"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="proj-link"
              :class="`proj-link--${link.type}`"
              @click="onLinkClick(link.url, link.type)"
            >
              <i :class="link.type === 'github' ? 'pi pi-github' : 'pi pi-external-link'" />
              {{ link.label }}
            </a>
          </div>

          <button
            class="proj-card__expand-btn"
            type="button"
            :aria-expanded="isExpanded"
            :aria-label="isExpanded ? `Collapse details for ${project.title}` : `Expand details for ${project.title}`"
            @click="toggleExpand"
          >
            <span>{{ isExpanded ? 'Less' : 'Deep dive' }}</span>
            <i
              class="pi pi-chevron-down"
              style="font-size:10px;"
              :style="{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }"
            />
          </button>
        </div>

        <!-- ── Expandable deep-dive ──────────────────────────── -->
        <Transition name="deep-dive">
          <div
            v-if="isExpanded"
            class="proj-card__deep-dive"
          >
            <div
              class="deep-dive__divider"
              :style="{ background: `linear-gradient(90deg, ${gradient.from}66, transparent)` }"
            />

            <div class="deep-dive__grid">
              <div
                v-if="project.problem"
                class="deep-dive__block"
              >
                <div class="deep-dive__block-header">
                  <div
                    class="deep-dive__icon-wrap"
                    style="background: rgba(239,68,68,0.1);"
                  >
                    <i
                      class="pi pi-exclamation-triangle"
                      style="color:#ef4444; font-size:13px;"
                    />
                  </div>
                  <span class="deep-dive__block-title">The Problem</span>
                </div>
                <p class="deep-dive__text">
                  {{ project.problem }}
                </p>
              </div>

              <div
                v-if="project.approach"
                class="deep-dive__block"
              >
                <div class="deep-dive__block-header">
                  <div
                    class="deep-dive__icon-wrap"
                    style="background: rgba(99,102,241,0.1);"
                  >
                    <i
                      class="pi pi-sitemap"
                      style="color:#6366f1; font-size:13px;"
                    />
                  </div>
                  <span class="deep-dive__block-title">Architecture & Approach</span>
                </div>
                <p class="deep-dive__text">
                  {{ project.approach }}
                </p>
              </div>

              <div
                v-if="project.outcome"
                class="deep-dive__block"
              >
                <div class="deep-dive__block-header">
                  <div
                    class="deep-dive__icon-wrap"
                    style="background: rgba(16,185,129,0.1);"
                  >
                    <i
                      class="pi pi-chart-line"
                      style="color:#10b981; font-size:13px;"
                    />
                  </div>
                  <span class="deep-dive__block-title">Business Impact</span>
                </div>
                <p class="deep-dive__text">
                  {{ project.outcome }}
                </p>
              </div>

              <div
                v-if="project.reflection"
                class="deep-dive__block"
              >
                <div class="deep-dive__block-header">
                  <div
                    class="deep-dive__icon-wrap"
                    style="background: rgba(245,158,11,0.1);"
                  >
                    <i
                      class="pi pi-lightbulb"
                      style="color:#f59e0b; font-size:13px;"
                    />
                  </div>
                  <span class="deep-dive__block-title">What I Learned</span>
                </div>
                <p class="deep-dive__text">
                  {{ project.reflection }}
                </p>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Project } from '@/types'
import { PROJECT_CATEGORY_CONFIG, PROJECT_GRADIENT } from '@/constants'
import { useAnalytics } from '@/composables/useAnalytics'

const props = defineProps<{ project: Project }>()

const gradient  = computed(() => PROJECT_GRADIENT[props.project.category])
const catConfig = computed(() => PROJECT_CATEGORY_CONFIG[props.project.category])

const { trackProjectView, trackProjectLinkClick, trackOutboundClick } = useAnalytics()

onMounted(() => trackProjectView(props.project.slug, props.project.title))

function onLinkClick(url: string, type: string) {
  trackProjectLinkClick(props.project.slug, type)
  trackOutboundClick(url, `${props.project.title} — ${type}`)
}

// ── Expand ────────────────────────────────────────────────────────
const isExpanded = ref(false)
function toggleExpand() { isExpanded.value = !isExpanded.value }

// ── 3D tilt ───────────────────────────────────────────────────────
const cardEl    = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const mouseX    = ref(50)
const mouseY    = ref(50)

function onMouseEnter() { isHovered.value = true }

function onMouseMove(e: MouseEvent) {
  const el = cardEl.value
  if (!el) return
  const { left, top, width, height } = el.getBoundingClientRect()
  mouseX.value = ((e.clientX - left) / width)  * 100
  mouseY.value = ((e.clientY - top)  / height) * 100
}

function onMouseLeave() {
  isHovered.value = false
  mouseX.value = 50
  mouseY.value = 50
}

// ── Mockup line widths ────────────────────────────────────────────
const LINE_WIDTHS = ['72%', '55%', '88%', '40%', '65%', '50%']
function mockupLineStyle(n: number) {
  return {
    width: LINE_WIDTHS[n - 1],
    background: n === 1
      ? `linear-gradient(90deg, ${gradient.value.from}88, ${gradient.value.to}44)`
      : 'rgba(255,255,255,0.06)',
    transitionDelay: isHovered.value ? `${(n - 1) * 40}ms` : '0ms',
  }
}

// ── Computed styles ───────────────────────────────────────────────
const borderStyle = computed(() => ({
  background: isHovered.value
    ? `conic-gradient(from ${mouseX.value * 3.6}deg at ${mouseX.value}% ${mouseY.value}%, ${gradient.value.from}, ${gradient.value.to}, transparent 45%)`
    : `linear-gradient(135deg, ${gradient.value.from}33, transparent 60%)`,
  opacity: isHovered.value ? 1 : 0.35,
  transition: 'opacity 0.3s',
}))

const glowStyle = computed(() => ({
  background: `radial-gradient(circle at ${mouseX.value}% ${mouseY.value}%, ${gradient.value.glow} 0%, transparent 55%)`,
  opacity: isHovered.value ? 1 : 0,
  transition: 'opacity 0.4s',
}))

const visualStyle = computed(() => ({
  background: `linear-gradient(135deg, ${gradient.value.from}18 0%, ${gradient.value.to}0d 100%), #111111`,
}))

const overlayStyle = computed(() => ({
  background: `linear-gradient(to bottom, transparent 40%, #111111 100%)`,
}))
</script>

<style scoped>
/* ── Card shell ────────────────────────────────────────────────── */
.proj-card {
  position: relative;
  border-radius: 20px;
  isolation: isolate;
  will-change: transform;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.proj-card:hover { transform: translateY(-4px); }

.proj-card__border {
  position: absolute;
  inset: -1px;
  border-radius: 21px;
  pointer-events: none;
  z-index: 0;
}

.proj-card__glow {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  pointer-events: none;
  z-index: 0;
}

.proj-card__inner {
  position: relative;
  z-index: 1;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(17, 17, 17, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Visual area ───────────────────────────────────────────────── */
.proj-card__visual {
  position: relative;
  height: 200px;
  overflow: hidden;
  flex-shrink: 0;
}

.proj-card__visual-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* Floating browser mockup */
.proj-card__mockup {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  width: 85%;
  border-radius: 10px 10px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(20, 20, 20, 0.95);
  overflow: hidden;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 2;
}

.proj-card__mockup--hovered {
  transform: translateX(-50%) translateY(0px);
}

.mockup-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.mockup-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.mockup-dot--red    { background: #ff5f57; }
.mockup-dot--yellow { background: #febc2e; }
.mockup-dot--green  { background: #28c840; }

.mockup-url {
  font-size: 9px;
  font-family: 'Geist Mono', monospace;
  color: #555555;
  margin-left: 6px;
  letter-spacing: 0.04em;
}

.mockup-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.mockup-line {
  height: 6px;
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.mockup-block {
  height: 28px;
  border-radius: 6px;
  margin-top: 4px;
}

/* Category badge */
.proj-card__cat-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
  border: 1px solid currentColor;
  border-opacity: 0.3;
}

.proj-card__year {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  font-size: 11px;
  font-family: 'Geist Mono', monospace;
  color: #555555;
  letter-spacing: 0.06em;
}

/* ── Content ───────────────────────────────────────────────────── */
.proj-card__content {
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
}

/* Header */
.proj-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.proj-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.proj-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #f5f5f5;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.proj-card__featured-tag {
  font-size: 9px;
  font-weight: 700;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 2px 7px;
  border-radius: 4px;
}

.proj-card__tagline {
  font-size: 13px;
  font-weight: 500;
  color: #737373;
  line-height: 1.5;
}

.proj-card__meta-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.proj-card__duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-family: 'Geist Mono', monospace;
  color: #555555;
}

.proj-card__role-badge {
  font-size: 10px;
  font-weight: 500;
  font-family: 'Geist Mono', monospace;
  color: #737373;
  text-align: right;
  max-width: 160px;
  line-height: 1.4;
}

/* Description */
.proj-card__desc {
  font-size: 13.5px;
  line-height: 1.75;
  color: #737373;
}

/* Metrics */
.proj-card__metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  border: 1px solid #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a1a;
}

@media (min-width: 480px) {
  .proj-card__metrics { grid-template-columns: repeat(4, 1fr); }
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 14px 10px;
  background: #0d0d0d;
  cursor: default;
  transition: background 0.2s;
}

.metric-item:hover { background: #111111; }

.metric-value {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.metric-label {
  font-size: 9px;
  font-family: 'Geist Mono', monospace;
  color: #555555;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
  line-height: 1.3;
}

/* Tech badges */
.proj-card__tech {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-badge {
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
  font-family: 'Geist Mono', monospace;
  color: #737373;
  border: 1px solid #1e1e1e;
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.2s, color 0.2s;
  letter-spacing: 0.02em;
}

.proj-card:hover .tech-badge {
  border-color: color-mix(in srgb, var(--tech-color, #6366f1) 30%, transparent);
  color: color-mix(in srgb, var(--tech-color, #6366f1) 80%, #a0a0a0);
}

/* Actions */
.proj-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: auto;
}

.proj-card__links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.proj-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  letter-spacing: 0.02em;
}

.proj-link--github {
  border: 1px solid #222222;
  color: #a0a0a0;
  background: transparent;
}

.proj-link--github:hover {
  border-color: #444444;
  color: #f5f5f5;
  background: rgba(255, 255, 255, 0.04);
}

.proj-link--live {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.proj-link--live:hover {
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.5);
  transform: translateY(-1px);
}

.proj-card__expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #222222;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: #737373;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.proj-card__expand-btn:hover {
  border-color: rgba(99, 102, 241, 0.3);
  color: #a0a0a0;
  background: rgba(99, 102, 241, 0.04);
}

/* ── Deep dive ─────────────────────────────────────────────────── */
.proj-card__deep-dive { overflow: hidden; }

.deep-dive__divider {
  height: 1px;
  margin-bottom: 20px;
  border-radius: 1px;
}

.deep-dive__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .deep-dive__grid { grid-template-columns: 1fr 1fr; }
}

.deep-dive__block {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #1a1a1a;
  background: rgba(255, 255, 255, 0.015);
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: blockIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes blockIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.deep-dive__block:nth-child(1) { animation-delay: 0ms;   }
.deep-dive__block:nth-child(2) { animation-delay: 60ms;  }
.deep-dive__block:nth-child(3) { animation-delay: 120ms; }
.deep-dive__block:nth-child(4) { animation-delay: 180ms; }

.deep-dive__block-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.deep-dive__icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.deep-dive__block-title {
  font-size: 12px;
  font-weight: 700;
  color: #e5e5e5;
  letter-spacing: 0.02em;
}

.deep-dive__text {
  font-size: 12.5px;
  line-height: 1.75;
  color: #737373;
}

/* ── Transition: deep dive ─────────────────────────────────────── */
.deep-dive-enter-active {
  transition: max-height 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
  max-height: 1200px;
  overflow: hidden;
}
.deep-dive-leave-active {
  transition: max-height 0.35s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.2s ease;
  max-height: 1200px;
  overflow: hidden;
}
.deep-dive-enter-from,
.deep-dive-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
