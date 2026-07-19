<template>
  <div class="fp-gallery">

    <!-- Thumbnail grid -->
    <div class="fp-gallery__grid">
      <button
        v-for="(shot, i) in EAM_SCREENSHOTS"
        :key="shot.id"
        class="fp-gallery__thumb"
        :class="{ 'fp-gallery__thumb--active': activeIndex === i }"
        :aria-label="`View screenshot: ${shot.label}`"
        @click="open(i)"
      >
        <!-- Placeholder visual -->
        <div class="fp-gallery__placeholder" :style="placeholderStyle(i)">
          <div class="fp-gallery__placeholder-bar" v-for="n in 4" :key="n" :style="barStyle(i, n)" />
          <div class="fp-gallery__placeholder-block" :style="blockStyle(i)" />
          <i :class="SCREEN_ICONS[i]" class="fp-gallery__placeholder-icon" />
        </div>
        <div class="fp-gallery__thumb-label">
          <span class="fp-gallery__thumb-title">{{ shot.label }}</span>
        </div>
        <div class="fp-gallery__thumb-overlay" aria-hidden="true">
          <i class="pi pi-search-plus" />
        </div>
      </button>
    </div>

    <!-- Active screenshot detail -->
    <Transition name="gallery-detail">
      <div v-if="active" class="fp-gallery__detail">
        <div class="fp-gallery__detail-visual" :style="detailStyle">
          <!-- Simulated UI screenshot -->
          <div class="fp-gallery__mock-ui">
            <div class="fp-gallery__mock-header">
              <div class="fp-gallery__mock-dots">
                <span /><span /><span />
              </div>
              <div class="fp-gallery__mock-title">{{ active.label }}</div>
            </div>
            <div class="fp-gallery__mock-body">
              <div class="fp-gallery__mock-sidebar">
                <div v-for="n in 6" :key="n" class="fp-gallery__mock-nav-item" :style="navItemStyle(n)" />
              </div>
              <div class="fp-gallery__mock-content">
                <div class="fp-gallery__mock-stat-row">
                  <div v-for="n in 4" :key="n" class="fp-gallery__mock-stat" :style="statStyle(n)" />
                </div>
                <div class="fp-gallery__mock-table">
                  <div class="fp-gallery__mock-table-header" />
                  <div v-for="n in 5" :key="n" class="fp-gallery__mock-table-row" :style="rowStyle(n)" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="fp-gallery__detail-info">
          <h4 class="fp-gallery__detail-title">{{ active.label }}</h4>
          <p class="fp-gallery__detail-desc">{{ active.description }}</p>
          <div class="fp-gallery__detail-nav">
            <button class="fp-gallery__nav-btn" :disabled="activeIndex === 0" @click="prev" aria-label="Previous screenshot">
              <i class="pi pi-chevron-left" />
            </button>
            <span class="fp-gallery__nav-count">{{ activeIndex + 1 }} / {{ EAM_SCREENSHOTS.length }}</span>
            <button class="fp-gallery__nav-btn" :disabled="activeIndex === EAM_SCREENSHOTS.length - 1" @click="next" aria-label="Next screenshot">
              <i class="pi pi-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { EAM_SCREENSHOTS } from '@/constants/featured-project.constants'

const SCREEN_ICONS = [
  'pi pi-chart-bar', 'pi pi-list', 'pi pi-wrench',
  'pi pi-calculator', 'pi pi-history', 'pi pi-qrcode',
]

const ACCENT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

const activeIndex = ref(0)
const active = computed(() => EAM_SCREENSHOTS[activeIndex.value])

function open(i: number) { activeIndex.value = i }
function prev() { if (activeIndex.value > 0) activeIndex.value-- }
function next() { if (activeIndex.value < EAM_SCREENSHOTS.length - 1) activeIndex.value++ }

// Keyboard navigation
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

// Placeholder styles — each screenshot gets a unique color accent
function placeholderStyle(i: number) {
  const c = ACCENT_COLORS[i % ACCENT_COLORS.length]
  return { background: `linear-gradient(135deg, ${c}12 0%, #111 100%)` }
}
function barStyle(i: number, n: number) {
  const c = ACCENT_COLORS[i % ACCENT_COLORS.length]
  const widths = ['80%', '60%', '90%', '45%']
  return { width: widths[n - 1], background: n === 1 ? `${c}55` : 'rgba(255,255,255,0.05)' }
}
function blockStyle(i: number) {
  const c = ACCENT_COLORS[i % ACCENT_COLORS.length]
  return { background: `${c}22` }
}

// Detail panel styles
const detailStyle = computed(() => {
  const c = ACCENT_COLORS[activeIndex.value % ACCENT_COLORS.length]
  return { background: `linear-gradient(135deg, ${c}10 0%, #0d0d0d 100%)`, borderColor: `${c}22` }
})

function navItemStyle(n: number) {
  const c = ACCENT_COLORS[activeIndex.value % ACCENT_COLORS.length]
  return { background: n === 2 ? `${c}33` : 'rgba(255,255,255,0.04)', borderColor: n === 2 ? `${c}44` : 'transparent' }
}
function statStyle(n: number) {
  const c = ACCENT_COLORS[activeIndex.value % ACCENT_COLORS.length]
  return { background: n === 1 ? `${c}22` : 'rgba(255,255,255,0.04)' }
}
function rowStyle(n: number) {
  return { opacity: 1 - (n - 1) * 0.12 }
}
</script>

<style scoped>
.fp-gallery { display: flex; flex-direction: column; gap: 24px; }

/* ── Thumbnail grid ─────────────────────────────────────────────── */
.fp-gallery__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 640px)  { .fp-gallery__grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .fp-gallery__grid { grid-template-columns: repeat(6, 1fr); } }

.fp-gallery__thumb {
  position: relative;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
  background: #111;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
  padding: 0;
  text-align: left;
}
.fp-gallery__thumb:hover { transform: translateY(-2px); border-color: rgba(99,102,241,0.3); }
.fp-gallery__thumb--active { border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }

.fp-gallery__placeholder {
  height: 80px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
}
.fp-gallery__placeholder-bar { height: 5px; border-radius: 3px; }
.fp-gallery__placeholder-block { height: 20px; border-radius: 5px; margin-top: 2px; }
.fp-gallery__placeholder-icon {
  position: absolute; bottom: 8px; right: 10px;
  font-size: 14px; color: rgba(255,255,255,0.15);
}

.fp-gallery__thumb-label {
  padding: 8px 10px;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.fp-gallery__thumb-title {
  font-size: 10px; font-weight: 600; font-family: 'Geist Mono', monospace;
  color: #737373; letter-spacing: 0.04em; display: block;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.fp-gallery__thumb-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(99,102,241,0.15); opacity: 0; transition: opacity 0.2s;
  font-size: 18px; color: #fff;
}
.fp-gallery__thumb:hover .fp-gallery__thumb-overlay { opacity: 1; }

/* ── Detail panel ──────────────────────────────────────────────── */
.fp-gallery__detail {
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}
@media (min-width: 768px) { .fp-gallery__detail { grid-template-columns: 1fr auto; } }

.fp-gallery__detail-visual {
  min-height: 280px;
  padding: 24px;
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.4s, border-color 0.4s;
}

/* Simulated UI mockup inside detail */
.fp-gallery__mock-ui {
  width: 100%; max-width: 560px;
  border-radius: 10px; border: 1px solid rgba(255,255,255,0.07);
  background: rgba(17,17,17,0.95); overflow: hidden;
}
.fp-gallery__mock-header {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05);
}
.fp-gallery__mock-dots { display: flex; gap: 5px; }
.fp-gallery__mock-dots span { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.1); }
.fp-gallery__mock-title { font-size: 10px; font-family: 'Geist Mono', monospace; color: #444; }

.fp-gallery__mock-body { display: flex; height: 200px; }

.fp-gallery__mock-sidebar {
  width: 120px; flex-shrink: 0; padding: 12px 8px;
  border-right: 1px solid rgba(255,255,255,0.04);
  display: flex; flex-direction: column; gap: 4px;
}
.fp-gallery__mock-nav-item {
  height: 28px; border-radius: 6px; border: 1px solid transparent;
  transition: background 0.3s, border-color 0.3s;
}

.fp-gallery__mock-content { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 10px; }

.fp-gallery__mock-stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.fp-gallery__mock-stat { height: 44px; border-radius: 7px; transition: background 0.3s; }

.fp-gallery__mock-table { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.fp-gallery__mock-table-header { height: 20px; border-radius: 4px; background: rgba(255,255,255,0.06); }
.fp-gallery__mock-table-row { height: 16px; border-radius: 4px; background: rgba(255,255,255,0.03); }

.fp-gallery__detail-info {
  padding: 24px; display: flex; flex-direction: column; gap: 12px;
  min-width: 220px; background: rgba(17,17,17,0.6);
}
.fp-gallery__detail-title { font-size: 15px; font-weight: 700; color: #e5e5e5; letter-spacing: -0.02em; }
.fp-gallery__detail-desc  { font-size: 13px; line-height: 1.7; color: #737373; flex: 1; }

.fp-gallery__detail-nav {
  display: flex; align-items: center; gap: 12px; margin-top: auto;
}
.fp-gallery__nav-btn {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid #222;
  background: transparent; color: #737373; cursor: pointer; display: flex;
  align-items: center; justify-content: center; font-size: 11px;
  transition: border-color 0.2s, color 0.2s;
}
.fp-gallery__nav-btn:hover:not(:disabled) { border-color: rgba(99,102,241,0.4); color: #a0a0a0; }
.fp-gallery__nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.fp-gallery__nav-count { font-size: 11px; font-family: 'Geist Mono', monospace; color: #555; }

/* ── Transition ────────────────────────────────────────────────── */
.gallery-detail-enter-active { transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1); }
.gallery-detail-leave-active { transition: opacity 0.2s ease; }
.gallery-detail-enter-from   { opacity: 0; transform: translateY(12px); }
.gallery-detail-leave-to     { opacity: 0; }
</style>
