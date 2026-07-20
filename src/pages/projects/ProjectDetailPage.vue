<template>
  <div
    class="project-detail-page"
    role="main"
  >
    <div class="project-detail-page__inner">
      <a
        href="/projects"
        class="back-link"
      >
        <i
          class="pi pi-arrow-left"
          style="font-size:11px;"
        />
        <span>Back to projects</span>
      </a>

      <template v-if="project">
        <header class="pd-header">
          <div class="pd-header__badges">
            <span
              class="pd-category"
              :style="categoryStyle"
            >
              <i
                :class="catConfig.icon"
                style="font-size:10px;"
              />
              {{ catConfig.label }}
            </span>
            <span
              v-if="project.featured"
              class="pd-featured"
            >Featured</span>
            <span class="pd-year">{{ project.year }}</span>
          </div>

          <h1 class="pd-title">
            {{ project.title }}
          </h1>
          <p class="pd-tagline">
            {{ project.tagline }}
          </p>

          <div class="pd-meta">
            <span class="pd-meta-item">
              <i
                class="pi pi-clock"
                style="font-size:10px;"
              />
              {{ project.duration }}
            </span>
            <span
              class="pd-meta-sep"
              aria-hidden="true"
            >·</span>
            <span class="pd-meta-item">{{ project.role }}</span>
          </div>
        </header>

        <!-- Metrics -->
        <div
          v-if="project.metrics?.length"
          class="pd-metrics"
        >
          <div
            v-for="m in project.metrics"
            :key="m.label"
            class="pd-metric"
            :title="m.description"
          >
            <span
              class="pd-metric__value"
              :style="{ color: gradient.from }"
            >{{ m.value }}</span>
            <span class="pd-metric__label">{{ m.label }}</span>
          </div>
        </div>

        <!-- Tech stack -->
        <div class="pd-tech">
          <span
            v-for="t in project.tech"
            :key="t.name"
            class="pd-tech-badge"
            :style="t.color ? { '--tc': t.color } : {}"
          >{{ t.name }}</span>
        </div>

        <!-- Deep dive sections -->
        <div class="pd-sections">
          <div
            v-if="project.problem"
            class="pd-section"
          >
            <div class="pd-section__header">
              <div
                class="pd-section__icon"
                style="background:rgba(239,68,68,0.1);"
              >
                <i
                  class="pi pi-exclamation-triangle"
                  style="color:#ef4444;"
                />
              </div>
              <h2 class="pd-section__title">
                The Problem
              </h2>
            </div>
            <p class="pd-section__body">
              {{ project.problem }}
            </p>
          </div>

          <div
            v-if="project.approach"
            class="pd-section"
          >
            <div class="pd-section__header">
              <div
                class="pd-section__icon"
                style="background:rgba(99,102,241,0.1);"
              >
                <i
                  class="pi pi-sitemap"
                  style="color:#6366f1;"
                />
              </div>
              <h2 class="pd-section__title">
                Architecture & Approach
              </h2>
            </div>
            <p class="pd-section__body">
              {{ project.approach }}
            </p>
          </div>

          <div
            v-if="project.outcome"
            class="pd-section"
          >
            <div class="pd-section__header">
              <div
                class="pd-section__icon"
                style="background:rgba(16,185,129,0.1);"
              >
                <i
                  class="pi pi-chart-line"
                  style="color:#10b981;"
                />
              </div>
              <h2 class="pd-section__title">
                Business Impact
              </h2>
            </div>
            <p class="pd-section__body">
              {{ project.outcome }}
            </p>
          </div>

          <div
            v-if="project.reflection"
            class="pd-section"
          >
            <div class="pd-section__header">
              <div
                class="pd-section__icon"
                style="background:rgba(245,158,11,0.1);"
              >
                <i
                  class="pi pi-lightbulb"
                  style="color:#f59e0b;"
                />
              </div>
              <h2 class="pd-section__title">
                What I Learned
              </h2>
            </div>
            <p class="pd-section__body">
              {{ project.reflection }}
            </p>
          </div>
        </div>

        <!-- Links -->
        <div class="pd-links">
          <a
            v-for="link in project.links"
            :key="link.type"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="pd-link"
            :class="`pd-link--${link.type}`"
          >
            <i :class="link.type === 'github' ? 'pi pi-github' : 'pi pi-external-link'" />
            {{ link.label }}
          </a>
          <a
            href="/projects"
            class="pd-link pd-link--back"
          >
            <i class="pi pi-arrow-left" />
            All projects
          </a>
        </div>
      </template>

      <!-- Not found -->
      <div
        v-else
        class="pd-not-found"
      >
        <i
          class="pi pi-search"
          style="font-size:32px; color:#333;"
        />
        <h1>Project not found</h1>
        <a
          href="/projects"
          class="pd-link pd-link--back"
        >
          Back to projects
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PROJECTS, PROJECT_CATEGORY_CONFIG, PROJECT_GRADIENT } from '@/constants'
import { usePageMeta } from '@/composables/usePageMeta'

const route   = useRoute()
const slug    = computed(() => route.params.slug as string)
const project = computed(() => PROJECTS.find(p => p.slug === slug.value) ?? null)

const gradient  = computed(() => project.value ? PROJECT_GRADIENT[project.value.category] : PROJECT_GRADIENT['backend'])
const catConfig = computed(() => project.value ? PROJECT_CATEGORY_CONFIG[project.value.category] : PROJECT_CATEGORY_CONFIG['backend'])

const categoryStyle = computed(() => ({
  color: catConfig.value.color,
  background: catConfig.value.bg,
  borderColor: `${catConfig.value.color}44`,
}))

usePageMeta({
  title: project.value ? `${project.value.title} | Yash Ranjan` : 'Project Not Found | Yash Ranjan',
  meta: [
    { name: 'description', content: project.value?.description ?? 'Project not found.' },
    { name: 'robots', content: project.value ? 'index, follow' : 'noindex, nofollow' },
    { property: 'og:title', content: project.value?.title ?? 'Project Not Found' },
    { property: 'og:description', content: project.value?.description ?? '' },
  ],
})
</script>

<style scoped>
.project-detail-page {
  min-height: 100vh;
  background: #0a0a0a;
  padding: 100px 0 80px;
}

.project-detail-page__inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.back-link {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 500; color: #555;
  text-decoration: none; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.04em; transition: color 0.2s; width: fit-content;
  border-radius: 4px;
}
.back-link:hover { color: #6366f1; }
.back-link:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 3px;
}

/* Header */
.pd-header { display: flex; flex-direction: column; gap: 16px; }

.pd-header__badges { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.pd-category {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 10px; font-weight: 700; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 6px; border: 1px solid;
}

.pd-featured {
  font-size: 9px; font-weight: 700; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #f59e0b; background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.3); padding: 3px 8px; border-radius: 4px;
}

.pd-year {
  font-size: 11px; font-family: 'Geist Mono', monospace; color: #555;
}

.pd-title {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800; letter-spacing: -0.035em; line-height: 1.1; color: #f5f5f5;
}

.pd-tagline { font-size: 18px; line-height: 1.6; color: #737373; }

.pd-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pd-meta-item { font-size: 12px; font-family: 'Geist Mono', monospace; color: #555; display: flex; align-items: center; gap: 5px; }
.pd-meta-sep { color: #333; }

/* Metrics */
.pd-metrics {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px;
  border: 1px solid #1a1a1a; border-radius: 16px; overflow: hidden; background: #1a1a1a;
}
@media (min-width: 480px) { .pd-metrics { grid-template-columns: repeat(4, 1fr); } }

.pd-metric {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 20px 16px; background: #0d0d0d; cursor: default; transition: background 0.2s;
}
.pd-metric:hover { background: #111; }
.pd-metric__value { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
.pd-metric__label { font-size: 10px; font-family: 'Geist Mono', monospace; color: #555; letter-spacing: 0.06em; text-transform: uppercase; text-align: center; }

/* Tech */
.pd-tech { display: flex; flex-wrap: wrap; gap: 8px; }
.pd-tech-badge {
  padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 500;
  font-family: 'Geist Mono', monospace; color: #737373;
  border: 1px solid #1e1e1e; background: rgba(255,255,255,0.02);
  transition: border-color 0.2s, color 0.2s;
}
.pd-tech-badge:hover {
  border-color: color-mix(in srgb, var(--tc, #6366f1) 40%, transparent);
  color: color-mix(in srgb, var(--tc, #6366f1) 80%, #a0a0a0);
}

/* Sections */
.pd-sections { display: flex; flex-direction: column; gap: 24px; }

.pd-section {
  padding: 28px 32px; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(17,17,17,0.8);
  display: flex; flex-direction: column; gap: 14px;
}

.pd-section__header { display: flex; align-items: center; gap: 12px; }

.pd-section__icon {
  width: 32px; height: 32px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  font-size: 14px;
}

.pd-section__title {
  font-size: 16px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.01em;
}

.pd-section__body { font-size: 15px; line-height: 1.85; color: #a0a0a0; }

/* Links */
.pd-links { display: flex; gap: 10px; flex-wrap: wrap; }

.pd-link {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
  text-decoration: none; transition: all 0.2s; letter-spacing: 0.02em;
}

.pd-link--github {
  border: 1px solid #222; color: #a0a0a0; background: transparent;
}
.pd-link--github:hover { border-color: #444; color: #f5f5f5; background: rgba(255,255,255,0.04); }

.pd-link--live {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; border: none; box-shadow: 0 4px 16px rgba(99,102,241,0.3);
}
.pd-link--live:hover { box-shadow: 0 6px 24px rgba(99,102,241,0.5); transform: translateY(-1px); }

.pd-link--back {
  border: 1px solid #1a1a1a; color: #555; background: transparent;
}
.pd-link--back:hover { border-color: #333; color: #a0a0a0; }

/* Not found */
.pd-not-found {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 80px 24px; text-align: center;
}
.pd-not-found h1 { font-size: 24px; font-weight: 700; color: #f5f5f5; }
</style>
