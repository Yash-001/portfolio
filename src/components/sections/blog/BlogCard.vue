<template>
  <article
    ref="cardEl"
    class="blog-card"
    :class="{ 'blog-card--featured': post.featured }"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @mouseenter="onMouseEnter"
  >
    <!-- Conic border -->
    <div
      class="blog-card__border"
      :style="borderStyle"
      aria-hidden="true"
    />
    <!-- Glow -->
    <div
      class="blog-card__glow"
      :style="glowStyle"
      aria-hidden="true"
    />

    <div class="blog-card__inner">
      <!-- Cover image / placeholder -->
      <div
        class="blog-card__cover"
        :style="coverStyle"
      >
        <img
          v-if="post.coverImage"
          :src="post.coverImage"
          :alt="post.title"
          class="blog-card__cover-img"
          loading="lazy"
        />
        <!-- Placeholder visual -->
        <div
          v-else
          class="blog-card__cover-placeholder"
        >
          <div
            class="blog-card__cover-grid"
            aria-hidden="true"
          />
          <div
            class="blog-card__cover-lines"
            aria-hidden="true"
          >
            <div
              v-for="n in 4"
              :key="n"
              class="blog-card__cover-line"
              :style="lineStyle(n)"
            />
          </div>
          <i
            :class="categoryIcon"
            class="blog-card__cover-icon"
            :style="iconStyle"
          />
        </div>

        <!-- Category badge -->
        <span
          class="blog-card__category"
          :style="categoryStyle"
        >
          {{ post.category }}
        </span>

        <!-- Reading time -->
        <span class="blog-card__reading-time">
          <i
            class="pi pi-clock"
            style="font-size:9px;"
          />
          {{ post.readingTime }} min read
        </span>
      </div>

      <!-- Content -->
      <div class="blog-card__content">
        <!-- Tags -->
        <div
          class="blog-card__tags"
          aria-label="Tags"
        >
          <span
            v-for="tag in post.tags.slice(0, 3)"
            :key="tag.slug"
            class="blog-card__tag"
          >#{{ tag.name }}</span>
        </div>

        <!-- Title -->
        <h3 class="blog-card__title">
          <RouterLink
            :to="`/blog/${post.slug}`"
            class="blog-card__title-link"
          >
            {{ post.title }}
          </RouterLink>
        </h3>

        <!-- Excerpt -->
        <p class="blog-card__excerpt">
          {{ post.excerpt }}
        </p>

        <!-- Footer -->
        <div class="blog-card__footer">
          <!-- Author -->
          <div class="blog-card__author">
            <div
              class="blog-card__author-avatar"
              :style="avatarStyle"
            >
              <img
                v-if="post.author.avatar"
                :src="post.author.avatar"
                :alt="post.author.name"
                class="blog-card__author-avatar-img"
              />
              <span
                v-else
                class="blog-card__author-initials"
              >
                {{ initials }}
              </span>
            </div>
            <div class="blog-card__author-info">
              <span class="blog-card__author-name">{{ post.author.name }}</span>
              <span class="blog-card__author-date">{{ formattedDate }}</span>
            </div>
          </div>

          <!-- Read more -->
          <RouterLink
            :to="`/blog/${post.slug}`"
            class="blog-card__read-more"
            :style="readMoreStyle"
          >
            <span>Read</span>
            <i
              class="pi pi-arrow-right"
              style="font-size:10px;"
            />
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BlogPostFull } from '@/constants/blog.constants'
import { BLOG_CATEGORY_CONFIG, BLOG_CATEGORY_GRADIENT } from '@/constants/blog.constants'

const props = defineProps<{ post: BlogPostFull }>()

const CATEGORY_ICONS: Record<string, string> = {
  'Backend':      'pi pi-server',
  'Frontend':     'pi pi-desktop',
  'DevOps':       'pi pi-cloud-upload',
  'AI & ML':      'pi pi-microchip-ai',
  'Career':       'pi pi-user',
  'Performance':  'pi pi-gauge',
}

const catConfig  = computed(() => BLOG_CATEGORY_CONFIG[props.post.category] ?? BLOG_CATEGORY_CONFIG['Architecture'])
const catGradient = computed(() => BLOG_CATEGORY_GRADIENT[props.post.category] ?? BLOG_CATEGORY_GRADIENT['Architecture'])
const categoryIcon = computed(() => CATEGORY_ICONS[props.post.category] ?? 'pi pi-file')

const initials = computed(() => {
  const parts = props.post.author.name.split(' ')
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0]
})

const formattedDate = computed(() => {
  return new Date(props.post.publishedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
})

// ── 3D tilt ───────────────────────────────────────────────────────
const cardEl    = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const mouseX    = ref(50)
const mouseY    = ref(50)

function onMouseEnter() { isHovered.value = true }
function onMouseLeave() { isHovered.value = false; mouseX.value = 50; mouseY.value = 50 }
function onMouseMove(e: MouseEvent) {
  const el = cardEl.value
  if (!el) return
  const { left, top, width, height } = el.getBoundingClientRect()
  mouseX.value = ((e.clientX - left) / width)  * 100
  mouseY.value = ((e.clientY - top)  / height) * 100
}

// ── Styles ────────────────────────────────────────────────────────
const borderStyle = computed(() => ({
  background: isHovered.value
    ? `conic-gradient(from ${mouseX.value * 3.6}deg at ${mouseX.value}% ${mouseY.value}%, ${catGradient.value.from}, ${catGradient.value.to}, transparent 45%)`
    : `linear-gradient(135deg, ${catGradient.value.from}33, transparent 60%)`,
  opacity: isHovered.value ? 1 : (props.post.featured ? 0.55 : 0.25),
  transition: 'opacity 0.3s',
}))

const glowStyle = computed(() => ({
  background: `radial-gradient(circle at ${mouseX.value}% ${mouseY.value}%, ${catGradient.value.from}22 0%, transparent 55%)`,
  opacity: isHovered.value ? 1 : 0,
  transition: 'opacity 0.4s',
}))

const coverStyle = computed(() => ({
  background: `linear-gradient(135deg, ${catGradient.value.from}18 0%, ${catGradient.value.to}0d 100%), #111`,
}))

const categoryStyle = computed(() => ({
  color: catConfig.value.color,
  background: catConfig.value.bg,
  borderColor: `${catConfig.value.color}33`,
}))

const iconStyle = computed(() => ({
  background: `linear-gradient(135deg, ${catGradient.value.from}, ${catGradient.value.to})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}))

const avatarStyle = computed(() => ({
  background: `linear-gradient(135deg, ${catGradient.value.from}33, ${catGradient.value.to}22)`,
  border: `1px solid ${catGradient.value.from}44`,
}))

const readMoreStyle = computed(() => ({
  '--rm-color': catConfig.value.color,
}))

function lineStyle(n: number) {
  const widths = ['75%', '55%', '88%', '42%']
  return {
    width: widths[n - 1],
    background: n === 1
      ? `linear-gradient(90deg, ${catGradient.value.from}66, ${catGradient.value.to}33)`
      : 'rgba(255,255,255,0.05)',
  }
}
</script>

<style scoped>
/* ── Card shell ────────────────────────────────────────────────── */
.blog-card {
  position: relative;
  border-radius: 20px;
  isolation: isolate;
  will-change: transform;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  height: 100%;
}
.blog-card:hover { transform: translateY(-4px); }

.blog-card__border {
  position: absolute; inset: -1px; border-radius: 21px;
  pointer-events: none; z-index: 0;
}
.blog-card__glow {
  position: absolute; inset: 0; border-radius: 20px;
  pointer-events: none; z-index: 0;
}

/* ── Inner ─────────────────────────────────────────────────────── */
.blog-card__inner {
  position: relative; z-index: 1;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(17,17,17,0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  display: flex; flex-direction: column;
  height: 100%;
}

.blog-card--featured .blog-card__inner {
  border-color: rgba(99,102,241,0.2);
}

/* ── Cover ─────────────────────────────────────────────────────── */
.blog-card__cover {
  position: relative;
  height: 200px;
  overflow: hidden;
  flex-shrink: 0;
}

.blog-card__cover-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.blog-card:hover .blog-card__cover-img { transform: scale(1.04); }

/* Placeholder */
.blog-card__cover-placeholder {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}

.blog-card__cover-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
}

.blog-card__cover-lines {
  position: absolute; bottom: 16px; left: 16px; right: 16px;
  display: flex; flex-direction: column; gap: 6px;
}
.blog-card__cover-line { height: 6px; border-radius: 3px; }

.blog-card__cover-icon {
  font-size: 36px; opacity: 0.15; position: relative; z-index: 1;
  transition: opacity 0.3s, transform 0.4s cubic-bezier(0.16,1,0.3,1);
}
.blog-card:hover .blog-card__cover-icon { opacity: 0.25; transform: scale(1.1); }

/* Badges */
.blog-card__category {
  position: absolute; top: 14px; left: 14px; z-index: 2;
  font-size: 10px; font-weight: 700; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 6px; border: 1px solid;
  backdrop-filter: blur(8px);
}

.blog-card__reading-time {
  position: absolute; top: 14px; right: 14px; z-index: 2;
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; font-family: 'Geist Mono', monospace; color: #737373;
  background: rgba(10,10,10,0.7); backdrop-filter: blur(8px);
  padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);
}

/* ── Content ───────────────────────────────────────────────────── */
.blog-card__content {
  padding: 22px 24px 24px;
  display: flex; flex-direction: column; gap: 14px; flex: 1;
}

/* Tags */
.blog-card__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.blog-card__tag {
  font-size: 10px; font-family: 'Geist Mono', monospace; color: #555;
  letter-spacing: 0.04em; transition: color 0.2s;
}
.blog-card:hover .blog-card__tag { color: #737373; }

/* Title */
.blog-card__title {
  font-size: 17px; font-weight: 700; color: #f0f0f0;
  letter-spacing: -0.025em; line-height: 1.35;
}
.blog-card__title-link {
  text-decoration: none; color: inherit;
  transition: color 0.2s;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.blog-card__title-link:hover { color: #fff; }

/* Excerpt */
.blog-card__excerpt {
  font-size: 13.5px; line-height: 1.75; color: #737373;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  flex: 1;
}

/* Footer */
.blog-card__footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; margin-top: auto; padding-top: 4px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.blog-card__author { display: flex; align-items: center; gap: 10px; }

.blog-card__author-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.blog-card__author-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.blog-card__author-initials {
  font-size: 11px; font-weight: 700; color: #e5e5e5; font-family: 'Geist Mono', monospace;
}

.blog-card__author-info { display: flex; flex-direction: column; gap: 1px; }
.blog-card__author-name { font-size: 12px; font-weight: 600; color: #a0a0a0; }
.blog-card__author-date { font-size: 10px; font-family: 'Geist Mono', monospace; color: #555; }

.blog-card__read-more {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600; font-family: 'Geist Mono', monospace;
  color: var(--rm-color, #6366f1); text-decoration: none; letter-spacing: 0.04em;
  transition: gap 0.2s;
  flex-shrink: 0;
}
.blog-card__read-more:hover { gap: 8px; }
</style>
