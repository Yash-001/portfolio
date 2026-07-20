<template>
  <section
    id="blog"
    ref="sectionEl"
    class="blog-section"
    aria-label="Blog"
  >
    <!-- Background -->
    <div
      class="blog-section__bg"
      aria-hidden="true"
    >
      <div class="blog-orb blog-orb--1" />
      <div class="blog-orb blog-orb--2" />
    </div>

    <!-- Header -->
    <div class="blog-section__header">
      <div
        ref="labelEl"
        class="blog-label"
      >
        <span class="blog-label__line" />
        <span class="blog-label__text">Blog</span>
      </div>

      <h2
        ref="headingEl"
        class="blog-section__heading"
      >
        Writing about what<br />
        <span class="blog-heading-accent">actually works.</span>
      </h2>

      <p
        ref="subEl"
        class="blog-section__sub"
      >
        Production lessons, architecture decisions, and engineering patterns
        from 7+ years of building systems that handle real load.
      </p>
    </div>

    <div class="blog-section__body">
      <!-- Featured post -->
      <div
        ref="featuredEl"
        class="blog-section__featured"
      >
        <BlogFeatured :post="featuredPost" />
      </div>

      <!-- Search + filter bar -->
      <div
        ref="filterEl"
        class="blog-section__controls"
      >
        <!-- Search -->
        <div class="blog-search">
          <i
            class="pi pi-search blog-search__icon"
            aria-hidden="true"
          />
          <input
            v-model="searchQuery"
            type="text"
            inputmode="search"
            placeholder="Search articles..."
            class="blog-search__input"
            aria-label="Search blog posts"
            @input="currentPage = 1"
          />
          <button
            v-if="searchQuery"
            class="blog-search__clear"
            type="button"
            aria-label="Clear search"
            @click="searchQuery = ''; currentPage = 1"
          >
            <i
              class="pi pi-times"
              style="font-size:10px;"
            />
          </button>
        </div>

        <!-- Category filter -->
        <div
          class="blog-filters"
          role="group"
          aria-label="Filter by category"
        >
          <button
            class="blog-filter-pill"
            type="button"
            :class="{ 'blog-filter-pill--active': activeCategory === 'all' }"
            @click="setCategory('all')"
          >
            All
          </button>
          <button
            v-for="cat in BLOG_CATEGORIES"
            :key="cat"
            class="blog-filter-pill"
            type="button"
            :class="{ 'blog-filter-pill--active': activeCategory === cat }"
            :style="activeCategory === cat ? activePillStyle(cat) : {}"
            @click="setCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Result count -->
        <div
          class="blog-result-count"
          aria-live="polite"
        >
          <span>{{ filteredPosts.length }} article{{ filteredPosts.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Cards grid -->
      <div
        ref="gridEl"
        class="blog-section__grid-wrap"
      >
        <TransitionGroup
          name="blog-grid"
          tag="div"
          class="blog-section__grid"
        >
          <BlogCard
            v-for="post in paginatedPosts"
            :key="post.id"
            :post="post"
            class="blog-grid-card"
          />
        </TransitionGroup>

        <!-- Empty state -->
        <div
          v-if="filteredPosts.length === 0"
          class="blog-empty"
        >
          <i class="pi pi-search blog-empty__icon" />
          <p class="blog-empty__text">
            No articles match your search.
          </p>
          <button
            class="blog-empty__reset"
            type="button"
            @click="resetFilters"
          >
            Reset filters
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        ref="paginationEl"
        class="blog-pagination"
        role="navigation"
        aria-label="Blog pagination"
      >
        <button
          class="blog-pagination__btn"
          :disabled="currentPage === 1"
          aria-label="Previous page"
          @click="currentPage--"
        >
          <i
            class="pi pi-chevron-left"
            style="font-size:11px;"
          />
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          class="blog-pagination__page"
          :class="{ 'blog-pagination__page--active': currentPage === page }"
          :aria-label="`Page ${page}`"
          :aria-current="currentPage === page ? 'page' : undefined"
          @click="currentPage = page"
        >
          {{ page }}
        </button>

        <button
          class="blog-pagination__btn"
          :disabled="currentPage === totalPages"
          aria-label="Next page"
          @click="currentPage++"
        >
          <i
            class="pi pi-chevron-right"
            style="font-size:11px;"
          />
        </button>
      </div>

      <!-- CTA -->
      <div
        ref="ctaEl"
        class="blog-section__cta"
      >
        <p class="blog-cta__text">
          Want to discuss any of these topics?
        </p>
        <a
          href="/#contact"
          class="blog-cta__btn"
        >
          <i class="pi pi-comments" />
          <span>Start a conversation</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'
import { BLOG_POSTS, BLOG_CATEGORIES, BLOG_CATEGORY_CONFIG, POSTS_PER_PAGE } from '@/constants/blog.constants'
import type { BlogCategory } from '@/constants/blog.constants'
import BlogCard     from './BlogCard.vue'
import BlogFeatured from './BlogFeatured.vue'

// ── Data ──────────────────────────────────────────────────────────
const featuredPost  = computed(() => BLOG_POSTS.find(p => p.featured) ?? BLOG_POSTS[0])
const nonFeatured   = computed(() => BLOG_POSTS.filter(p => !p.featured))

// ── Filters ───────────────────────────────────────────────────────
const searchQuery   = ref('')
const activeCategory = ref<BlogCategory | 'all'>('all')
const currentPage   = ref(1)

function setCategory(cat: BlogCategory | 'all') {
  activeCategory.value = cat
  currentPage.value = 1
}

function resetFilters() {
  searchQuery.value = ''
  activeCategory.value = 'all'
  currentPage.value = 1
}

const filteredPosts = computed(() => {
  let posts = nonFeatured.value
  if (activeCategory.value !== 'all') {
    posts = posts.filter(p => p.category === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.name.toLowerCase().includes(q))
    )
  }
  return posts
})

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / POSTS_PER_PAGE))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * POSTS_PER_PAGE
  return filteredPosts.value.slice(start, start + POSTS_PER_PAGE)
})

// Reset page when search changes (category already resets in setCategory)
watch(searchQuery, () => { currentPage.value = 1 })

// ── Active pill style ─────────────────────────────────────────────
function activePillStyle(cat: string) {
  const c = BLOG_CATEGORY_CONFIG[cat]
  return { color: c.color, background: c.bg, borderColor: `${c.color}44` }
}

// ── GSAP entrance ─────────────────────────────────────────────────
const sectionEl    = ref<HTMLElement | null>(null)
const labelEl      = ref<HTMLElement | null>(null)
const headingEl    = ref<HTMLElement | null>(null)
const subEl        = ref<HTMLElement | null>(null)
const featuredEl   = ref<HTMLElement | null>(null)
const filterEl     = ref<HTMLElement | null>(null)
const gridEl       = ref<HTMLElement | null>(null)
const paginationEl = ref<HTMLElement | null>(null)
const ctaEl        = ref<HTMLElement | null>(null)

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
    gsap.from(featuredEl.value, {
      scrollTrigger: { trigger: featuredEl.value, start: 'top 85%', once: true },
      opacity: 0, y: 40, duration: 0.8, ease,
    })
    gsap.from(filterEl.value, {
      scrollTrigger: { trigger: filterEl.value, start: 'top 88%', once: true },
      opacity: 0, y: 20, duration: 0.5, ease,
    })
    gsap.from('.blog-grid-card', {
      scrollTrigger: { trigger: gridEl.value, start: 'top 82%', once: true },
      opacity: 0, y: 40, scale: 0.97,
      duration: 0.65, ease, stagger: 0.08,
    })
    gsap.from(ctaEl.value, {
      scrollTrigger: { trigger: ctaEl.value, start: 'top 90%', once: true },
      opacity: 0, y: 24, duration: 0.6, ease,
    })
  }, sectionEl.value!)
})

onUnmounted(() => gsapCtx?.revert())
</script>

<style scoped>
/* ── Section ───────────────────────────────────────────────────── */
.blog-section {
  position: relative;
  padding: 120px 0 100px;
  background: #080808;
  overflow: hidden;
}

/* ── Background ────────────────────────────────────────────────── */
.blog-section__bg { position: absolute; inset: 0; pointer-events: none; }
.blog-orb {
  position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none;
}
.blog-orb--1 {
  width: 600px; height: 600px; top: -100px; right: -150px;
  background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
  animation: blogOrb 16s ease-in-out infinite;
}
.blog-orb--2 {
  width: 500px; height: 500px; bottom: 100px; left: -100px;
  background: radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%);
  animation: blogOrb 20s ease-in-out infinite reverse;
}
@keyframes blogOrb {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(30px, -40px); }
}

/* ── Header ────────────────────────────────────────────────────── */
.blog-section__header {
  max-width: 1280px; margin: 0 auto; padding: 0 24px;
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; text-align: center; margin-bottom: 64px;
}

.blog-label { display: flex; align-items: center; gap: 16px; }
.blog-label__line { display: block; width: 40px; height: 1px; background: #6366f1; flex-shrink: 0; }
.blog-label__text {
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: #6366f1; font-family: 'Geist Mono', monospace;
}

.blog-section__heading {
  font-size: clamp(32px, 4vw, 56px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.1; color: #f5f5f5;
}
.blog-heading-accent {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.blog-section__sub {
  font-size: 16px; line-height: 1.7; color: #737373; max-width: 500px;
}

/* ── Body ──────────────────────────────────────────────────────── */
.blog-section__body {
  max-width: 1280px; margin: 0 auto; padding: 0 24px;
  display: flex; flex-direction: column; gap: 48px;
}

/* ── Controls ──────────────────────────────────────────────────── */
.blog-section__controls {
  display: flex; flex-direction: column; gap: 16px;
}

/* Search */
.blog-search {
  position: relative; max-width: 480px;
}
.blog-search__icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  font-size: 13px; color: #555; pointer-events: none;
}
.blog-search__input {
  width: 100%; padding: 11px 40px 11px 40px;
  border-radius: 10px; border: 1px solid #1e1e1e;
  background: rgba(255,255,255,0.03); color: #e5e5e5;
  font-size: 14px; font-family: inherit; outline: none;
  transition: border-color 0.2s, background 0.2s;
  box-sizing: border-box;
}
.blog-search__input::placeholder { color: #444; }
.blog-search__input:focus {
  border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.04);
}
.blog-search__clear {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  width: 20px; height: 20px; border-radius: 50%; border: none;
  background: rgba(255,255,255,0.06); color: #737373; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.blog-search__clear:hover { background: rgba(255,255,255,0.1); }
.blog-search__clear:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Category filter pills */
.blog-filters {
  display: flex; flex-wrap: wrap; gap: 8px;
}
.blog-filter-pill {
  padding: 7px 16px; border-radius: 100px;
  border: 1px solid #1e1e1e; background: transparent;
  font-size: 12px; font-weight: 500; color: #737373;
  cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em;
  font-family: inherit;
}
.blog-filter-pill:hover { border-color: #333; color: #a0a0a0; }
.blog-filter-pill--active {
  color: #6366f1; background: rgba(99,102,241,0.1);
  border-color: rgba(99,102,241,0.35);
}
.blog-filter-pill:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Result count */
.blog-result-count {
  font-size: 12px; font-family: 'Geist Mono', monospace; color: #555;
}

/* ── Grid ──────────────────────────────────────────────────────── */
.blog-section__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  position: relative;
}
@media (min-width: 640px)  { .blog-section__grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .blog-section__grid { grid-template-columns: repeat(3, 1fr); } }

/* TransitionGroup */
.blog-grid-enter-active {
  transition: opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1);
}
.blog-grid-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  position: absolute;
}
.blog-grid-enter-from { opacity: 0; transform: translateY(20px) scale(0.97); }
.blog-grid-leave-to   { opacity: 0; transform: scale(0.95); }
.blog-grid-move       { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }

/* Empty state */
.blog-empty {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 80px 24px; text-align: center;
}
.blog-empty__icon { font-size: 32px; color: #333; }
.blog-empty__text { font-size: 15px; color: #555; }
.blog-empty__reset {
  padding: 10px 20px; border-radius: 8px; border: 1px solid #222;
  background: transparent; color: #737373; cursor: pointer; font-size: 13px;
  transition: border-color 0.2s, color 0.2s;
}
.blog-empty__reset:hover { border-color: rgba(99,102,241,0.3); color: #a0a0a0; }
.blog-empty__reset:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* ── Pagination ────────────────────────────────────────────────── */
.blog-pagination {
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.blog-pagination__btn {
  width: 36px; height: 36px; border-radius: 8px;
  border: 1px solid #1e1e1e; background: transparent;
  color: #737373; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: border-color 0.2s, color 0.2s;
}
.blog-pagination__btn:hover:not(:disabled) { border-color: rgba(99,102,241,0.3); color: #a0a0a0; }
.blog-pagination__btn:disabled { opacity: 0.3; cursor: not-allowed; }

.blog-pagination__page {
  width: 36px; height: 36px; border-radius: 8px;
  border: 1px solid #1e1e1e; background: transparent;
  font-size: 13px; font-weight: 500; color: #737373;
  cursor: pointer; transition: all 0.2s;
}
.blog-pagination__page:hover { border-color: rgba(99,102,241,0.3); color: #a0a0a0; }
.blog-pagination__page--active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent; color: #fff; font-weight: 700;
  box-shadow: 0 4px 12px rgba(99,102,241,0.35);
}

/* ── CTA ───────────────────────────────────────────────────────── */
.blog-section__cta {
  display: flex; align-items: center; justify-content: center;
  gap: 20px; flex-wrap: wrap; padding-top: 8px;
}
.blog-cta__text { font-size: 15px; color: #737373; }
.blog-cta__btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 600;
  text-decoration: none; letter-spacing: 0.02em;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,0.3);
  transition: box-shadow 0.3s, transform 0.2s;
}
.blog-cta__btn:hover { box-shadow: 0 8px 32px rgba(99,102,241,0.5); transform: translateY(-2px); }
</style>
