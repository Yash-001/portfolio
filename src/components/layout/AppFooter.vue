<template>
  <footer class="app-footer">
    <div class="app-footer__inner">

      <!-- Brand column -->
      <div class="app-footer__brand">
        <RouterLink to="/" class="footer-logo" aria-label="Home">
          <span class="logo-mark">YR</span>
          <span class="logo-text">{{ APP_NAME }}</span>
        </RouterLink>
        <p class="footer-tagline">{{ APP_TAGLINE }}</p>

        <div class="footer-social">
          <a
            v-for="s in SOCIAL_LINKS_NAV"
            :key="s.platform"
            :href="s.url"
            :aria-label="s.label"
            target="_blank"
            rel="noopener noreferrer"
            class="social-btn"
          >
            <i :class="s.icon" />
          </a>
        </div>
      </div>

      <!-- Nav columns -->
      <div class="app-footer__links">
        <div class="footer-col">
          <p class="footer-col__heading">Pages</p>
          <RouterLink
            v-for="link in colA"
            :key="link.to"
            :to="link.to"
            class="footer-link"
          >{{ link.label }}</RouterLink>
        </div>
        <div class="footer-col">
          <p class="footer-col__heading">More</p>
          <RouterLink
            v-for="link in colB"
            :key="link.to"
            :to="link.to"
            class="footer-link"
          >{{ link.label }}</RouterLink>
        </div>
      </div>

    </div>

    <!-- Bottom bar -->
    <div class="app-footer__bottom">
      <p class="text-body-xs text-content-tertiary font-mono">
        © {{ year }} {{ APP_NAME }} · Built with Vue 3 + Spring Boot
      </p>
      <div class="flex items-center gap-1">
        <span class="availability-dot" />
        <span class="text-body-xs text-success-400 font-mono">{{ APP_AVAILABILITY_TEXT }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { FOOTER_LINKS, SOCIAL_LINKS_NAV, APP_NAME, APP_TAGLINE, APP_AVAILABILITY_TEXT } from '@/constants'

const year = new Date().getFullYear()
const half = Math.ceil(FOOTER_LINKS.length / 2)
const colA = FOOTER_LINKS.slice(0, half)
const colB = FOOTER_LINKS.slice(half)
</script>

<style scoped>
.app-footer {
  border-top: 1px solid #222222;
  background: #0a0a0a;
  padding-top: 64px;
}

.app-footer__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px 48px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
}

@media (min-width: 768px) {
  .app-footer__inner {
    grid-template-columns: 1.5fr 1fr;
  }
}

.app-footer__brand {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.05em;
  font-family: 'Geist Mono', monospace;
}

.logo-text {
  font-size: 15px;
  font-weight: 600;
  color: #f5f5f5;
}

.footer-tagline {
  font-size: 14px;
  color: #737373;
  line-height: 1.6;
  max-width: 320px;
}

.footer-social {
  display: flex;
  gap: 8px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #222222;
  color: #737373;
  transition: border-color 0.2s, color 0.2s;
}

.social-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.app-footer__links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col__heading {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #555555;
  margin-bottom: 4px;
}

.footer-link {
  font-size: 14px;
  color: #737373;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #f5f5f5;
}

.app-footer__bottom {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 24px;
  border-top: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.availability-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: pulseDot 2s ease-in-out infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.85); }
}
</style>
