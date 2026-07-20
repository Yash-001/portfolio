<template>
  <div
    class="blog-post-page"
    role="main"
  >
    <div class="blog-post-page__inner">
      <!-- Back link -->
      <RouterLink
        to="/blog"
        class="back-link"
      >
        <i
          class="pi pi-arrow-left"
          style="font-size:11px;"
        />
        <span>Back to blog</span>
      </RouterLink>

      <!-- Post found -->
      <template v-if="post">
        <header class="post-header">
          <div class="post-header__meta">
            <span
              class="post-category"
              :style="categoryStyle"
            >{{ post.category }}</span>
            <span class="post-reading-time">
              <i
                class="pi pi-clock"
                style="font-size:10px;"
              />
              {{ post.readingTime }} min read
            </span>
          </div>

          <h1 class="post-title">
            {{ post.title }}
          </h1>
          <p class="post-excerpt">
            {{ post.excerpt }}
          </p>

          <div class="post-author">
            <div class="post-author__avatar">
              <span>{{ initials }}</span>
            </div>
            <div>
              <p class="post-author__name">
                {{ post.author.name }}
              </p>
              <p class="post-author__date">
                {{ formattedDate }}
              </p>
            </div>
          </div>
        </header>

        <!-- Tags -->
        <div class="post-tags">
          <span
            v-for="tag in post.tags"
            :key="tag.slug"
            class="post-tag"
          >#{{ tag.name }}</span>
        </div>

        <!-- Content placeholder -->
        <div class="post-content-placeholder">
          <div class="placeholder-panel">
            <i class="pi pi-file-edit placeholder-panel__icon" />
            <h2 class="placeholder-panel__heading">
              Full article coming soon
            </h2>
            <p class="placeholder-panel__sub">
              This article is being written. Subscribe to the newsletter in the footer
              to be notified when it publishes.
            </p>
            <RouterLink
              to="/blog"
              class="placeholder-panel__btn"
            >
              Browse other articles
            </RouterLink>
          </div>
        </div>
      </template>

      <!-- Post not found -->
      <div
        v-else
        class="post-not-found"
      >
        <i class="pi pi-search post-not-found__icon" />
        <h1 class="post-not-found__heading">
          Article not found
        </h1>
        <p class="post-not-found__sub">
          This article doesn't exist or has been removed.
        </p>
        <RouterLink
          to="/blog"
          class="post-not-found__btn"
        >
          Back to blog
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { BLOG_POSTS, BLOG_CATEGORY_CONFIG } from '@/constants/blog.constants'
import { usePageMeta } from '@/composables/usePageMeta'

const route = useRoute()
const slug  = computed(() => route.params.slug as string)
const post  = computed(() => BLOG_POSTS.find(p => p.slug === slug.value) ?? null)

const initials = computed(() => {
  if (!post.value) return ''
  const parts = post.value.author.name.split(' ')
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0]
})

const formattedDate = computed(() =>
  post.value
    ? new Date(post.value.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '',
)

const categoryStyle = computed(() => {
  if (!post.value) return {}
  const c = BLOG_CATEGORY_CONFIG[post.value.category] ?? BLOG_CATEGORY_CONFIG['Architecture']
  return { color: c.color, background: c.bg, borderColor: `${c.color}33` }
})

usePageMeta({
  title: post.value ? `${post.value.title} | Yash Ranjan` : 'Article Not Found | Yash Ranjan',
  meta: [
    { name: 'description', content: post.value?.excerpt ?? 'Blog post not found.' },
    { name: 'robots', content: post.value ? 'index, follow' : 'noindex, nofollow' },
    { property: 'og:title', content: post.value?.title ?? 'Article Not Found' },
    { property: 'og:description', content: post.value?.excerpt ?? '' },
  ],
})
</script>

<style scoped>
.blog-post-page {
  min-height: 100vh;
  background: #0a0a0a;
  padding: 100px 0 80px;
}

.blog-post-page__inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  text-decoration: none;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.04em;
  transition: color 0.2s;
  width: fit-content;
  border-radius: 4px;
}
.back-link:hover { color: #6366f1; }
.back-link:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 3px;
}

/* Post header */
.post-header { display: flex; flex-direction: column; gap: 16px; }

.post-header__meta { display: flex; align-items: center; gap: 12px; }

.post-category {
  font-size: 10px; font-weight: 700; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 6px; border: 1px solid;
}

.post-reading-time {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-family: 'Geist Mono', monospace; color: #555;
}

.post-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.15;
  color: #f5f5f5;
}

.post-excerpt {
  font-size: 17px;
  line-height: 1.8;
  color: #737373;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.post-author__avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2));
  border: 1px solid rgba(99,102,241,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #e5e5e5;
  font-family: 'Geist Mono', monospace;
  flex-shrink: 0;
}

.post-author__name { font-size: 13px; font-weight: 600; color: #e5e5e5; }
.post-author__date { font-size: 11px; font-family: 'Geist Mono', monospace; color: #555; margin-top: 2px; }

/* Tags */
.post-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.post-tag {
  font-size: 11px; font-family: 'Geist Mono', monospace; color: #555;
  letter-spacing: 0.04em;
}

/* Content placeholder */
.post-content-placeholder {
  margin-top: 16px;
}

.placeholder-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 40px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(17,17,17,0.8);
  text-align: center;
}

.placeholder-panel__icon {
  font-size: 32px;
  color: #333;
}

.placeholder-panel__heading {
  font-size: 20px;
  font-weight: 700;
  color: #f5f5f5;
  letter-spacing: -0.02em;
}

.placeholder-panel__sub {
  font-size: 14px;
  line-height: 1.75;
  color: #737373;
  max-width: 40ch;
}

.placeholder-panel__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 8px;
  border: 1px solid rgba(99,102,241,0.3);
  background: rgba(99,102,241,0.08);
  color: #a5b4fc;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  margin-top: 4px;
}
.placeholder-panel__btn:hover {
  background: rgba(99,102,241,0.15);
  border-color: rgba(99,102,241,0.5);
}

/* Not found */
.post-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 24px;
  text-align: center;
}

.post-not-found__icon { font-size: 32px; color: #333; }
.post-not-found__heading { font-size: 24px; font-weight: 700; color: #f5f5f5; }
.post-not-found__sub { font-size: 14px; color: #737373; }
.post-not-found__btn {
  display: inline-flex;
  padding: 10px 22px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  margin-top: 8px;
  transition: opacity 0.2s;
}
.post-not-found__btn:hover { opacity: 0.85; }
</style>
