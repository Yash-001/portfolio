<template>
  <div class="hp-root">
    <!-- Skip-to-content for keyboard / screen-reader users -->
    <a
      href="#main-sections"
      class="hp-skip-link"
    >Skip to content</a>

    <div
      class="hp"
      :class="{ 'hp--ready': mounted }"
    >
      <!-- ── ScrollSpy dot-nav (desktop only) ───────────────────── -->
      <nav
        class="hp-spy-nav"
        aria-label="Section navigation"
        role="navigation"
      >
        <ul class="hp-spy-nav__list">
          <li
            v-for="s in SECTIONS"
            :key="s.id"
          >
            <button
              class="hp-spy-dot"
              type="button"
              :class="{ 'hp-spy-dot--active': activeSection === s.id }"
              :aria-label="`Go to ${s.label} section`"
              :aria-current="activeSection === s.id ? 'true' : undefined"
              :title="s.label"
              @click="scrollTo(s.id)"
            />
          </li>
        </ul>
      </nav>

      <!-- ── Sections ────────────────────────────────────────────── -->
      <div id="main-sections">
        <!-- Hero — always eager, above the fold -->
        <SectionShell
          id="hero"
          label="Hero"
          :eager="true"
        >
          <HeroSection />
        </SectionShell>

        <!-- All remaining sections lazy-mount via IntersectionObserver -->
        <SectionShell
          v-for="s in LAZY_SECTIONS"
          :id="s.id"
          :key="s.id"
          :label="s.label"
          :visible="isVisible(s.id)"
        >
          <Suspense>
            <component
              :is="s.component"
              v-if="isVisible(s.id)"
            />
            <template #fallback>
              <SectionSkeleton :height="s.skeletonHeight" />
            </template>
          </Suspense>
        </SectionShell>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref, defineAsyncComponent, onMounted, onUnmounted,
} from 'vue'
import { usePageMeta } from '@/composables/usePageMeta'
import { useScrollSpy } from '@/composables/useScrollSpy'
import { useSectionObserver } from '@/composables/useSectionObserver'
import { PAGE_META, DEFAULT_META } from '@/constants'
import {
  OWNER_NAME, OWNER_TITLE, SITE_URL, GITHUB_URL, LINKEDIN_URL,
} from '@/config/portfolio.config'

// ── Eager (above-the-fold) ─────────────────────────────────────
import HeroSection from '@/components/sections/home/HeroSection.vue'

// ── Async section components (code-split per section) ──────────
const AboutSection = defineAsyncComponent(
  () => import('@/components/sections/about/AboutSection.vue'),
)
const SkillsSection = defineAsyncComponent(
  () => import('@/components/sections/skills/SkillsSection.vue'),
)
const ExperienceSection = defineAsyncComponent(
  () => import('@/components/sections/experience/ExperienceSection.vue'),
)
const ProjectsSection = defineAsyncComponent(
  () => import('@/components/sections/projects/ProjectsSection.vue'),
)
const FeaturedProjectSection = defineAsyncComponent(
  () => import('@/components/sections/featured/FeaturedProjectSection.vue'),
)
const ServicesSection = defineAsyncComponent(
  () => import('@/components/sections/services/ServicesSection.vue'),
)
const TestimonialsSection = defineAsyncComponent(
  () => import('@/components/sections/testimonials/TestimonialsSection.vue'),
)
const BlogSection = defineAsyncComponent(
  () => import('@/components/sections/blog/BlogSection.vue'),
)
const ContactSection = defineAsyncComponent(
  () => import('@/components/sections/contact/ContactSection.vue'),
)

// ── Section registry ───────────────────────────────────────────
const SECTIONS = [
  { id: 'hero',     label: 'Hero'             },
  { id: 'about',    label: 'About'            },
  { id: 'skills',   label: 'Skills'           },
  { id: 'experience', label: 'Experience'     },
  { id: 'projects', label: 'Projects'         },
  { id: 'featured', label: 'Featured Project' },
  { id: 'services', label: 'Services'         },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'blog',     label: 'Blog'             },
  { id: 'contact',  label: 'Contact'          },
] as const

type SectionId = typeof SECTIONS[number]['id']

const LAZY_SECTIONS: Array<{
  id: SectionId
  label: string
  component: ReturnType<typeof defineAsyncComponent>
  skeletonHeight: string
}> = [
  { id: 'about',        label: 'About',            component: AboutSection,           skeletonHeight: '600px'  },
  { id: 'skills',       label: 'Skills',           component: SkillsSection,          skeletonHeight: '700px'  },
  { id: 'experience',   label: 'Experience',       component: ExperienceSection,      skeletonHeight: '800px'  },
  { id: 'projects',     label: 'Projects',         component: ProjectsSection,        skeletonHeight: '900px'  },
  { id: 'featured',     label: 'Featured Project', component: FeaturedProjectSection, skeletonHeight: '1000px' },
  { id: 'services',     label: 'Services',         component: ServicesSection,        skeletonHeight: '800px'  },
  { id: 'testimonials', label: 'Testimonials',     component: TestimonialsSection,    skeletonHeight: '600px'  },
  { id: 'blog',         label: 'Blog',             component: BlogSection,            skeletonHeight: '900px'  },
  { id: 'contact',      label: 'Contact',          component: ContactSection,         skeletonHeight: '700px'  },
]

// ── ScrollSpy ──────────────────────────────────────────────────
const { activeSection, scrollTo } = useScrollSpy({
  sectionIds: SECTIONS.map((s) => s.id),
})

// ── Lazy-mount observer ────────────────────────────────────────
// Pre-seed hero as visible; observe the rest
const { isVisible } = useSectionObserver(
  LAZY_SECTIONS.map((s) => s.id),
  '0px 0px -5% 0px',
)

// ── Mount ──────────────────────────────────────────────────────
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
onUnmounted(() => {})

// ── SEO / <head> ───────────────────────────────────────────────
const meta = PAGE_META['home']
usePageMeta({
  title: meta.title,
  canonical: 'https://yashranjan.dev/',
  meta: [
    { name: 'description',         content: meta.description ?? '' },
    { name: 'keywords',            content: DEFAULT_META.keywords ?? '' },
    { name: 'robots',              content: 'index, follow' },
    { property: 'og:type',         content: 'website' },
    { property: 'og:title',        content: meta.title ?? '' },
    { property: 'og:description',  content: meta.description ?? '' },
    { property: 'og:image',        content: DEFAULT_META.ogImage ?? '' },
    { name: 'twitter:card',        content: 'summary_large_image' },
    { name: 'twitter:title',       content: meta.title ?? '' },
    { name: 'twitter:description', content: meta.description ?? '' },
  ],
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: OWNER_NAME,
    jobTitle: OWNER_TITLE,
    url: SITE_URL,
    sameAs: [
      GITHUB_URL,
      LINKEDIN_URL,
    ],
    knowsAbout: ['Java', 'Spring Boot', 'Vue.js', 'AWS', 'PostgreSQL'],
  },
})
</script>

<script lang="ts">
/* eslint-disable vue/one-component-per-file */
/**
 * SectionShell — thin wrapper that:
 *  - provides the section `id` anchor for ScrollSpy
 *  - adds `aria-label` for screen readers
 *  - applies the reveal transition once visible
 *  - renders a placeholder div (for IntersectionObserver targeting)
 *    even before the component mounts
 */
import { defineComponent, h } from 'vue'

export const SectionShell = defineComponent({
  name: 'SectionShell',
  props: {
    id:             { type: String,  required: true },
    label:          { type: String,  required: true },
    visible:        { type: Boolean, default: true  },
    eager:          { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'section',
        {
          id: props.id,
          'aria-label': props.label,
          class: [
            'hp-section',
            (props.eager || props.visible) ? 'hp-section--visible' : '',
          ],
        },
        slots.default?.(),
      )
  },
})

/**
 * SectionSkeleton — lightweight shimmer placeholder shown
 * while the async component chunk is loading.
 */
export const SectionSkeleton = defineComponent({
  name: 'SectionSkeleton',
  props: {
    height: { type: String, default: '600px' },
  },
  setup(props) {
    return () =>
      h('div', {
        class: 'hp-skeleton',
        style: { minHeight: props.height },
        'aria-hidden': 'true',
        role: 'presentation',
      })
  },
})
</script>

<style scoped>
/* ── Root wrapper (single root for <Transition>) ──────────────── */
.hp-root {
  display: contents;
}

/* ── Skip link ─────────────────────────────────────────────────── */
.hp-skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  z-index: 10000;
  padding: 10px 20px;
  background: #6366f1;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 0 0 8px 8px;
  text-decoration: none;
  transition: top 0.2s;
}
.hp-skip-link:focus { top: 0; }

/* ── Page shell ────────────────────────────────────────────────── */
.hp {
  background: #0a0a0a;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.hp--ready { opacity: 1; }

/* ── ScrollSpy dot nav ─────────────────────────────────────────── */
.hp-spy-nav {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 200;
  display: none; /* hidden on mobile */
}
@media (min-width: 1280px) { .hp-spy-nav { display: block; } }

.hp-spy-nav__list {
  list-style: none;
  padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 10px;
}

.hp-spy-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.25s;
  display: block;
}
.hp-spy-dot:hover {
  border-color: #6366f1;
  background: rgba(99,102,241,0.3);
  transform: scale(1.3);
}
.hp-spy-dot:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 3px;
}
.hp-spy-dot--active {
  background: #6366f1;
  border-color: #6366f1;
  transform: scale(1.25);
  box-shadow: 0 0 8px rgba(99,102,241,0.6);
}

/* ── Section shell ─────────────────────────────────────────────── */
:deep(.hp-section) {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
:deep(.hp-section--visible) {
  opacity: 1;
  transform: translateY(0);
}

/* ── Skeleton shimmer ──────────────────────────────────────────── */
:deep(.hp-skeleton) {
  background: linear-gradient(
    90deg,
    #111 25%,
    #1a1a1a 50%,
    #111 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  :deep(.hp-section) {
    transition: none;
    opacity: 1;
    transform: none;
  }
  :deep(.hp-skeleton) { animation: none; }
  .hp-scroll-progress { display: none; }
}
</style>
