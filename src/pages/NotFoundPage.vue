<template>
  <div
    class="not-found"
    role="main"
    aria-label="Page not found"
  >
    <div class="not-found__inner">
      <div
        class="not-found__code"
        aria-hidden="true"
      >
        404
      </div>

      <h1 class="not-found__heading">
        Page not found.
      </h1>
      <p class="not-found__sub">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div class="not-found__actions">
        <RouterLink
          to="/"
          class="not-found__btn not-found__btn--primary"
        >
          <i class="pi pi-home" />
          <span>Back to home</span>
        </RouterLink>
        <RouterLink
          to="/contact"
          class="not-found__btn not-found__btn--secondary"
        >
          <i class="pi pi-envelope" />
          <span>Contact me</span>
        </RouterLink>
      </div>

      <nav
        class="not-found__links"
        aria-label="Quick navigation"
      >
        <a href="/#projects">Work</a>
        <a href="/#skills">Skills</a>
        <RouterLink to="/services">Services</RouterLink>
        <RouterLink to="/blog">Blog</RouterLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePageMeta } from '@/composables/usePageMeta'

usePageMeta({
  title: '404 — Page Not Found | Yash Ranjan',
  meta: [
    { name: 'description', content: 'The page you are looking for does not exist.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 24px 80px;
}

.not-found__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  max-width: 480px;
}

.not-found__code {
  font-size: clamp(80px, 15vw, 140px);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  user-select: none;
}

.not-found__heading {
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700;
  color: #f5f5f5;
  letter-spacing: -0.03em;
  margin: 0;
}

.not-found__sub {
  font-size: 16px;
  line-height: 1.7;
  color: #737373;
  max-width: 36ch;
}

.not-found__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.not-found__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s;
  letter-spacing: 0.02em;
}

.not-found__btn--primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
}
.not-found__btn--primary:hover {
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.55);
  transform: translateY(-2px);
}

.not-found__btn--secondary {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #a0a0a0;
}
.not-found__btn--secondary:hover {
  border-color: rgba(99, 102, 241, 0.3);
  color: #e5e5e5;
}

.not-found__links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.not-found__links a {
  font-size: 13px;
  color: #555;
  text-decoration: none;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.04em;
  transition: color 0.2s;
}
.not-found__links a:hover { color: #6366f1; }
</style>
