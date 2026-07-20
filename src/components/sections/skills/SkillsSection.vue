<template>
  <section
    ref="sectionEl"
    class="skills-section"
    aria-label="Skills and expertise"
  >
    <!-- Background ambient -->
    <div
      class="skills-section__bg"
      aria-hidden="true"
    >
      <div class="bg-orb bg-orb--1" />
      <div class="bg-orb bg-orb--2" />
    </div>

    <!-- Section header -->
    <div class="skills-section__header">
      <div
        ref="labelEl"
        class="section-label"
      >
        <span class="label-line" />
        <span class="label-text">{{ t('skills.label') }}</span>
      </div>

      <h2
        ref="headingEl"
        class="skills-section__heading"
      >
        {{ t('skills.heading') }}
        <span class="heading-accent">{{ t('skills.headingAccent') }}</span>
      </h2>

      <p
        ref="subEl"
        class="skills-section__sub"
      >
        {{ t('skills.sub') }}
      </p>

      <!-- Filter -->
      <div
        ref="filterEl"
        class="skills-section__filter"
      >
        <SkillCategoryFilter
          v-model="activeCategory"
          :groups="SKILL_GROUPS"
        />
      </div>
    </div>

    <!-- Card grid -->
    <div class="skills-section__grid-wrap">
      <TransitionGroup
        name="card-grid"
        tag="div"
        class="skills-section__grid"
      >
        <SkillCard
          v-for="group in filteredGroups"
          :key="group.category"
          :group="group"
          class="grid-card"
        />
      </TransitionGroup>
    </div>

    <!-- Bottom summary strip -->
    <div
      ref="summaryEl"
      class="skills-summary"
    >
      <div
        v-for="item in SUMMARY"
        :key="item.key"
        class="summary-item"
      >
        <span class="summary-item__value">{{ t(`skills.summary.${item.key}.value`) }}</span>
        <span class="summary-item__label">{{ t(`skills.summary.${item.key}.label`) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { SkillCategory } from '@/types'
import { gsap } from '@/plugins/gsap'
import { SKILL_GROUPS } from '@/constants'
import SkillCard from './SkillCard.vue'
import SkillCategoryFilter from './SkillCategoryFilter.vue'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()

const SUMMARY = [
  { key: 'years'      },
  { key: 'tech'       },
  { key: 'categories' },
  { key: 'clients'    },
] as const

const activeCategory = ref<SkillCategory | 'all'>('all')

const filteredGroups = computed(() =>
  activeCategory.value === 'all'
    ? SKILL_GROUPS
    : SKILL_GROUPS.filter((g) => g.category === activeCategory.value),
)

// ── Refs ──────────────────────────────────────────────────────────
const sectionEl = ref<HTMLElement | null>(null)
const labelEl   = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const subEl     = ref<HTMLElement | null>(null)
const filterEl  = ref<HTMLElement | null>(null)
const summaryEl = ref<HTMLElement | null>(null)

// ── GSAP entrance ─────────────────────────────────────────────────
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

    gsap.from(filterEl.value, {
      scrollTrigger: { trigger: filterEl.value, start: 'top 90%', once: true },
      opacity: 0, y: 16, duration: 0.5, ease, delay: 0.15,
    })

    gsap.from('.grid-card', {
      scrollTrigger: { trigger: '.skills-section__grid', start: 'top 82%', once: true },
      opacity: 0, y: 40, scale: 0.96,
      duration: 0.65, ease, stagger: 0.08,
    })

    gsap.from(summaryEl.value!.querySelectorAll('.summary-item'), {
      scrollTrigger: { trigger: summaryEl.value, start: 'top 88%', once: true },
      opacity: 0, y: 20, duration: 0.5, ease, stagger: 0.08,
    })

  }, sectionEl.value!)
})

onUnmounted(() => gsapCtx?.revert())
</script>

<style scoped>
/* ── Section shell ─────────────────────────────────────────────── */
.skills-section {
  position: relative;
  padding: 120px 0 100px;
  background: #0a0a0a;
  overflow: hidden;
}

/* ── Background orbs ───────────────────────────────────────────── */
.skills-section__bg {
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
  width: 500px;
  height: 500px;
  top: -100px;
  right: -100px;
  background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
}

.bg-orb--2 {
  width: 400px;
  height: 400px;
  bottom: 0;
  left: -100px;
  background: radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%);
}

/* ── Header ────────────────────────────────────────────────────── */
.skills-section__header {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  margin-bottom: 56px;
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

.skills-section__heading {
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #f5f5f5;
  max-width: 640px;
}

.heading-accent {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.skills-section__sub {
  font-size: 16px;
  line-height: 1.7;
  color: #737373;
  max-width: 480px;
}

.skills-section__filter {
  width: 100%;
  max-width: 900px;
  padding-top: 8px;
}

/* ── Card grid ─────────────────────────────────────────────────── */
.skills-section__grid-wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.skills-section__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {
  .skills-section__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .skills-section__grid { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1280px) {
  .skills-section__grid { grid-template-columns: repeat(4, 1fr); }
}

/* ── TransitionGroup animations ────────────────────────────────── */
.card-grid-enter-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-grid-leave-active {
  transition: opacity 0.25s ease,
              transform 0.25s ease;
  position: absolute;
}

.card-grid-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.97);
}

.card-grid-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.card-grid-move {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Summary strip ─────────────────────────────────────────────── */
.skills-summary {
  max-width: 1280px;
  margin: 56px auto 0;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  border: 1px solid #1a1a1a;
  border-radius: 16px;
  overflow: hidden;
  background: #1a1a1a;
}

@media (min-width: 640px) {
  .skills-summary { grid-template-columns: repeat(4, 1fr); }
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 20px;
  background: #0a0a0a;
  transition: background 0.2s;
}

.summary-item:hover { background: #111111; }

.summary-item__value {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #f5f5f5;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #f5f5f5, #a0a0a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.summary-item__label {
  font-size: 12px;
  color: #555555;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.04em;
  text-align: center;
}
</style>
