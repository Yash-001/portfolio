<template>
  <section
    ref="sectionEl"
    class="projects-section"
    aria-label="Projects showcase"
  >
    <!-- Ambient background -->
    <div
      class="projects-section__bg"
      aria-hidden="true"
    >
      <div class="bg-orb bg-orb--1" />
      <div class="bg-orb bg-orb--2" />
      <div class="bg-orb bg-orb--3" />
    </div>

    <!-- ── Section header ──────────────────────────────────────── -->
    <div class="projects-section__header">
      <div
        ref="labelEl"
        class="section-label"
      >
        <span class="label-line" />
        <span class="label-text">Work</span>
      </div>

      <h2
        ref="headingEl"
        class="projects-section__heading"
      >
        Selected projects.
        <span class="heading-accent">Real systems.</span>
      </h2>

      <p
        ref="subEl"
        class="projects-section__sub"
      >
        Not side projects. Not tutorials. Production systems that processed
        real money, served real clients, and ran without me watching them.
      </p>
    </div>

    <!-- ── Filter bar ──────────────────────────────────────────── -->
    <div
      ref="filterEl"
      class="projects-section__filter-wrap"
    >
      <ProjectsFilter
        v-model:search="searchQuery"
        v-model:category="activeCategory"
        :count="filteredProjects.length"
      />
    </div>

    <!-- ── Card grid ───────────────────────────────────────────── -->
    <div class="projects-section__grid-wrap">
      <TransitionGroup
        v-if="filteredProjects.length"
        name="proj-grid"
        tag="div"
        class="projects-section__grid"
      >
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
          class="proj-grid-item"
        />
      </TransitionGroup>

      <!-- Empty state -->
      <Transition name="fade">
        <div
          v-if="!filteredProjects.length"
          class="projects-empty"
        >
          <div class="projects-empty__icon">
            <i class="pi pi-search" />
          </div>
          <p class="projects-empty__title">
            No projects found
          </p>
          <p class="projects-empty__sub">
            Try a different search term or category
          </p>
          <button
            class="projects-empty__reset"
            type="button"
            @click="resetFilters"
          >
            Clear filters
          </button>
        </div>
      </Transition>
    </div>

    <!-- ── CTA strip ───────────────────────────────────────────── -->
    <div
      ref="ctaEl"
      class="projects-cta"
    >
      <div class="projects-cta__inner">
        <div>
          <p class="projects-cta__heading">
            Have a system that needs fixing?
          </p>
          <p class="projects-cta__sub">
            I work with founders and CTOs directly. No agencies, no middlemen.
          </p>
        </div>
        <RouterLink
          to="/contact"
          class="projects-cta__btn"
        >
          <span>Let's talk</span>
          <i
            class="pi pi-arrow-right"
            style="font-size:12px;"
          />
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'
import type { ProjectCategory } from '@/types'
import { PROJECTS } from '@/constants'
import ProjectCard    from './ProjectCard.vue'
import ProjectsFilter from './ProjectsFilter.vue'

// ── Filter state ──────────────────────────────────────────────────
const searchQuery    = ref('')
const activeCategory = ref<ProjectCategory | 'all'>('all')

const filteredProjects = computed(() => {
  let list = [...PROJECTS].sort((a, b) => a.order - b.order)

  if (activeCategory.value !== 'all') {
    list = list.filter((p) => p.category === activeCategory.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((p) =>
      p.title.toLowerCase().includes(q)       ||
      p.tagline.toLowerCase().includes(q)     ||
      p.description.toLowerCase().includes(q) ||
      p.tech.some((t) => t.name.toLowerCase().includes(q)),
    )
  }

  return list
})

function resetFilters() {
  searchQuery.value    = ''
  activeCategory.value = 'all'
}

// ── Refs ──────────────────────────────────────────────────────────
const sectionEl = ref<HTMLElement | null>(null)
const labelEl   = ref<HTMLElement | null>(null)
const headingEl = ref<HTMLElement | null>(null)
const subEl     = ref<HTMLElement | null>(null)
const filterEl  = ref<HTMLElement | null>(null)
const ctaEl     = ref<HTMLElement | null>(null)

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

    gsap.from('.proj-grid-item', {
      scrollTrigger: { trigger: '.projects-section__grid', start: 'top 82%', once: true },
      opacity: 0, y: 48, scale: 0.96,
      duration: 0.7, ease, stagger: 0.1,
    })

    gsap.from(ctaEl.value, {
      scrollTrigger: { trigger: ctaEl.value, start: 'top 88%', once: true },
      opacity: 0, y: 24, duration: 0.6, ease,
    })

  }, sectionEl.value!)
})

onUnmounted(() => gsapCtx?.revert())
</script>

<style scoped>
/* ── Section shell ─────────────────────────────────────────────── */
.projects-section {
  position: relative;
  padding: 120px 0 100px;
  background: #0a0a0a;
  overflow: hidden;
}

/* ── Background orbs ───────────────────────────────────────────── */
.projects-section__bg {
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
  width: 500px; height: 500px;
  top: 5%; right: -150px;
  background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
}

.bg-orb--2 {
  width: 400px; height: 400px;
  top: 40%; left: -100px;
  background: radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%);
}

.bg-orb--3 {
  width: 350px; height: 350px;
  bottom: 10%; right: 10%;
  background: radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%);
}

/* ── Header ────────────────────────────────────────────────────── */
.projects-section__header {
  max-width: 1280px;
  margin: 0 auto 56px;
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

.projects-section__heading {
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

.projects-section__sub {
  font-size: 16px;
  line-height: 1.7;
  color: #737373;
  max-width: 520px;
}

/* ── Filter ────────────────────────────────────────────────────── */
.projects-section__filter-wrap {
  max-width: 1280px;
  margin: 0 auto 48px;
  padding: 0 24px;
}

/* ── Grid ──────────────────────────────────────────────────────── */
.projects-section__grid-wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  min-height: 300px;
}

.projects-section__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .projects-section__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1280px) {
  .projects-section__grid { grid-template-columns: repeat(3, 1fr); }
}

/* TransitionGroup */
.proj-grid-enter-active {
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.proj-grid-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  position: absolute;
}
.proj-grid-enter-from { opacity: 0; transform: translateY(24px) scale(0.97); }
.proj-grid-leave-to   { opacity: 0; transform: scale(0.95); }
.proj-grid-move       { transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1); }

/* Empty state */
.projects-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 24px;
  text-align: center;
}

.projects-empty__icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  border: 1px solid #222222;
  background: #111111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #555555;
  margin-bottom: 8px;
}

.projects-empty__title {
  font-size: 16px;
  font-weight: 600;
  color: #a0a0a0;
}

.projects-empty__sub {
  font-size: 13px;
  color: #555555;
}

.projects-empty__reset {
  margin-top: 8px;
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid #222222;
  background: transparent;
  color: #737373;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.projects-empty__reset:hover {
  border-color: rgba(99, 102, 241, 0.3);
  color: #a0a0a0;
}
.projects-empty__reset:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Fade utility */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }

/* ── CTA strip ─────────────────────────────────────────────────── */
.projects-cta {
  max-width: 1280px;
  margin: 64px auto 0;
  padding: 0 24px;
}

.projects-cta__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  padding: 32px 40px;
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  background: rgba(99, 102, 241, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.projects-cta__heading {
  font-size: 18px;
  font-weight: 700;
  color: #f5f5f5;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.projects-cta__sub {
  font-size: 14px;
  color: #737373;
}

.projects-cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
  transition: box-shadow 0.3s, transform 0.2s;
}

.projects-cta__btn:hover {
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.55);
  transform: translateY(-2px);
}
</style>
