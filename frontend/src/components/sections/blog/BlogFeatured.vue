<template>
  <article
    class="blog-featured"
    aria-label="Featured article"
  >
    <!-- Cover -->
    <div
      class="blog-featured__cover"
      :style="coverStyle"
    >
      <img
        v-if="post.coverImage"
        :src="post.coverImage"
        :alt="post.title"
        class="blog-featured__cover-img"
        loading="eager"
      />
      <div
        v-else
        class="blog-featured__cover-placeholder"
      >
        <div
          class="blog-featured__cover-grid"
          aria-hidden="true"
        />
        <div
          class="blog-featured__cover-lines"
          aria-hidden="true"
        >
          <div
            v-for="n in 5"
            :key="n"
            class="blog-featured__cover-line"
            :style="lineStyle(n)"
          />
        </div>
        <i
          :class="categoryIcon"
          class="blog-featured__cover-icon"
          :style="iconStyle"
        />
      </div>
      <div class="blog-featured__cover-overlay" />

      <!-- Floating badges -->
      <div class="blog-featured__badges">
        <span class="blog-featured__featured-tag">
          <i
            class="pi pi-star-fill"
            style="font-size:9px;"
          />
          Featured
        </span>
        <span
          class="blog-featured__category"
          :style="categoryStyle"
        >
          {{ post.category }}
        </span>
      </div>

      <span class="blog-featured__reading-time">
        <i
          class="pi pi-clock"
          style="font-size:9px;"
        />
        {{ post.readingTime }} min read
      </span>
    </div>

    <!-- Content -->
    <div class="blog-featured__content">
      <!-- Tags -->
      <div class="blog-featured__tags">
        <span
          v-for="tag in post.tags"
          :key="tag.slug"
          class="blog-featured__tag"
        >#{{ tag.name }}</span>
      </div>

      <!-- Title -->
      <h2 class="blog-featured__title">
        <RouterLink
          :to="`/blog/${post.slug}`"
          class="blog-featured__title-link"
        >
          {{ post.title }}
        </RouterLink>
      </h2>

      <!-- Excerpt -->
      <p class="blog-featured__excerpt">
        {{ post.excerpt }}
      </p>

      <!-- Footer -->
      <div class="blog-featured__footer">
        <div class="blog-featured__author">
          <div
            class="blog-featured__author-avatar"
            :style="avatarStyle"
          >
            <img
              v-if="post.author.avatar"
              :src="post.author.avatar"
              :alt="post.author.name"
              class="blog-featured__author-img"
            />
            <span
              v-else
              class="blog-featured__author-initials"
            >{{ initials }}</span>
          </div>
          <div class="blog-featured__author-info">
            <span class="blog-featured__author-name">{{ post.author.name }}</span>
            <span class="blog-featured__author-meta">
              {{ post.author.role }}
              <span aria-hidden="true">·</span>
              {{ formattedDate }}
            </span>
          </div>
        </div>

        <RouterLink
          :to="`/blog/${post.slug}`"
          class="blog-featured__cta"
          :style="ctaStyle"
        >
          <span>Read article</span>
          <i
            class="pi pi-arrow-right"
            style="font-size:11px;"
          />
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlogPostFull } from '@/constants/blog.constants'
import { BLOG_CATEGORY_CONFIG, BLOG_CATEGORY_GRADIENT } from '@/constants/blog.constants'

const props = defineProps<{ post: BlogPostFull }>()

const CATEGORY_ICONS: Record<string, string> = {
  'Architecture': 'pi pi-sitemap',
  'Backend':      'pi pi-server',
  'Frontend':     'pi pi-desktop',
  'DevOps':       'pi pi-cloud-upload',
  'AI & ML':      'pi pi-microchip-ai',
  'Career':       'pi pi-user',
  'Performance':  'pi pi-gauge',
}

const catConfig   = computed(() => BLOG_CATEGORY_CONFIG[props.post.category] ?? BLOG_CATEGORY_CONFIG['Architecture'])
const catGradient = computed(() => BLOG_CATEGORY_GRADIENT[props.post.category] ?? BLOG_CATEGORY_GRADIENT['Architecture'])
const categoryIcon = computed(() => CATEGORY_ICONS[props.post.category] ?? 'pi pi-file')

const initials = computed(() => {
  const parts = props.post.author.name.split(' ')
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0]
})

const formattedDate = computed(() =>
  new Date(props.post.publishedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
)

const coverStyle    = computed(() => ({ background: `linear-gradient(135deg, ${catGradient.value.from}20 0%, ${catGradient.value.to}10 100%), #111` }))
const categoryStyle = computed(() => ({ color: catConfig.value.color, background: catConfig.value.bg, borderColor: `${catConfig.value.color}33` }))
const iconStyle     = computed(() => ({ background: `linear-gradient(135deg, ${catGradient.value.from}, ${catGradient.value.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }))
const avatarStyle   = computed(() => ({ background: `linear-gradient(135deg, ${catGradient.value.from}33, ${catGradient.value.to}22)`, border: `1px solid ${catGradient.value.from}44` }))
const ctaStyle      = computed(() => ({ background: `linear-gradient(135deg, ${catGradient.value.from}, ${catGradient.value.to})`, boxShadow: `0 4px 20px ${catGradient.value.from}44` }))

function lineStyle(n: number) {
  const widths = ['80%', '60%', '92%', '45%', '70%']
  return {
    width: widths[n - 1],
    background: n === 1
      ? `linear-gradient(90deg, ${catGradient.value.from}77, ${catGradient.value.to}44)`
      : 'rgba(255,255,255,0.05)',
  }
}
</script>

<style scoped>
.blog-featured {
  border-radius: 24px;
  border: 1px solid rgba(99,102,241,0.15);
  background: rgba(17,17,17,0.95);
  backdrop-filter: blur(20px);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s;
}
@media (min-width: 768px) {
  .blog-featured { grid-template-columns: 1fr 1fr; }
}
.blog-featured:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 64px rgba(99,102,241,0.12);
}

/* Cover */
.blog-featured__cover {
  position: relative; min-height: 280px; overflow: hidden;
}
@media (min-width: 768px) { .blog-featured__cover { min-height: 360px; } }

.blog-featured__cover-img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
}
.blog-featured:hover .blog-featured__cover-img { transform: scale(1.04); }

.blog-featured__cover-placeholder {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
}
.blog-featured__cover-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 32px 32px;
}
.blog-featured__cover-lines {
  position: absolute; bottom: 24px; left: 24px; right: 24px;
  display: flex; flex-direction: column; gap: 7px;
}
.blog-featured__cover-line { height: 7px; border-radius: 4px; }
.blog-featured__cover-icon {
  font-size: 64px; opacity: 0.12; position: relative; z-index: 1;
  transition: opacity 0.3s, transform 0.4s;
}
.blog-featured:hover .blog-featured__cover-icon { opacity: 0.2; transform: scale(1.08); }

.blog-featured__cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to right, transparent 60%, rgba(17,17,17,0.4) 100%);
}

.blog-featured__badges {
  position: absolute; top: 16px; left: 16px; z-index: 2;
  display: flex; gap: 8px; align-items: center;
}
.blog-featured__featured-tag {
  display: flex; align-items: center; gap: 5px;
  font-size: 9px; font-weight: 700; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #f59e0b; background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.3); padding: 4px 9px; border-radius: 5px;
  backdrop-filter: blur(8px);
}
.blog-featured__category {
  font-size: 10px; font-weight: 700; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 6px; border: 1px solid;
  backdrop-filter: blur(8px);
}
.blog-featured__reading-time {
  position: absolute; top: 16px; right: 16px; z-index: 2;
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; font-family: 'Geist Mono', monospace; color: #737373;
  background: rgba(10,10,10,0.75); backdrop-filter: blur(8px);
  padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);
}

/* Content */
.blog-featured__content {
  padding: 32px 36px;
  display: flex; flex-direction: column; gap: 18px; justify-content: center;
}

.blog-featured__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.blog-featured__tag {
  font-size: 11px; font-family: 'Geist Mono', monospace; color: #555; letter-spacing: 0.04em;
}

.blog-featured__title {
  font-size: clamp(20px, 2.5vw, 28px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.25; color: #f5f5f5;
}
.blog-featured__title-link {
  text-decoration: none; color: inherit; transition: color 0.2s;
}
.blog-featured__title-link:hover { color: #fff; }

.blog-featured__excerpt {
  font-size: 14.5px; line-height: 1.8; color: #737373;
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}

.blog-featured__footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap; margin-top: auto;
  padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.06);
}

.blog-featured__author { display: flex; align-items: center; gap: 12px; }
.blog-featured__author-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.blog-featured__author-img { width: 100%; height: 100%; object-fit: cover; }
.blog-featured__author-initials {
  font-size: 13px; font-weight: 700; color: #e5e5e5; font-family: 'Geist Mono', monospace;
}
.blog-featured__author-info { display: flex; flex-direction: column; gap: 2px; }
.blog-featured__author-name { font-size: 13px; font-weight: 600; color: #e5e5e5; }
.blog-featured__author-meta {
  font-size: 11px; font-family: 'Geist Mono', monospace; color: #555;
  display: flex; align-items: center; gap: 6px;
}

.blog-featured__cta {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 20px; border-radius: 10px; font-size: 13px; font-weight: 600;
  text-decoration: none; color: #fff; letter-spacing: 0.02em;
  transition: box-shadow 0.3s, transform 0.2s;
}
.blog-featured__cta:hover { transform: translateY(-1px); filter: brightness(1.1); }
</style>
