<template>
  <header class="app-navbar" :class="{ 'app-navbar--scrolled': scrolled }">
    <div class="app-navbar__inner">

      <!-- Logo -->
      <RouterLink to="/" class="app-navbar__logo" aria-label="Home">
        <span class="logo-mark">YR</span>
        <span class="logo-text">{{ APP_NAME }}</span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="app-navbar__nav" aria-label="Primary navigation">
        <RouterLink
          v-for="link in NAV_LINKS"
          :key="link.to"
          :to="link.to"
          class="nav-link"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Actions -->
      <div class="app-navbar__actions">
        <AppThemeSwitcher />

        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          class="hidden md:flex"
        >
          <Button label="Resume" icon="pi pi-download" size="small" outlined />
        </a>

        <!-- Hamburger (mobile) -->
        <Button
          icon="pi pi-bars"
          text
          rounded
          aria-label="Open menu"
          class="md:hidden"
          @click="ui.toggleMobileMenu()"
        />
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import AppThemeSwitcher from './AppThemeSwitcher.vue'
import { useUiStore } from '@/stores/ui.store'
import { NAV_LINKS, APP_NAME } from '@/constants'

const ui      = useUiStore()
const scrolled = ref(false)

function onScroll() { scrolled.value = window.scrollY > 20 }

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.app-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  height: 64px;
  transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
  border-bottom: 1px solid transparent;
}

.app-navbar--scrolled {
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom-color: #222222;
}

.app-navbar__inner {
  max-width: 1280px;
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.app-navbar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
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
  letter-spacing: -0.01em;
}

.app-navbar__nav {
  display: none;
  align-items: center;
  gap: 4px;
  flex: 1;
}

@media (min-width: 768px) {
  .app-navbar__nav { display: flex; }
}

.nav-link {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #a0a0a0;
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
}

.nav-link:hover {
  color: #f5f5f5;
  background: rgba(255, 255, 255, 0.05);
}

.nav-link.router-link-active {
  color: #6366f1;
}

.app-navbar__actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
