<template>
  <header
    class="app-navbar"
    :class="{ 'app-navbar--scrolled': scrolled }"
  >
    <div class="app-navbar__inner">
      <!-- Logo -->
      <RouterLink
        to="/"
        class="app-navbar__logo"
        aria-label="Home"
      >
        <span class="logo-mark">YR</span>
        <span class="logo-text">{{ APP_NAME }}</span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav
        class="app-navbar__nav"
        aria-label="Primary navigation"
      >
        <RouterLink
          v-for="link in NAV_LINKS"
          :key="link.to"
          :to="link.to"
          custom
          v-slot="{ href, navigate }"
        >
          <a
            :href="href"
            class="nav-link"
            :class="{ 'nav-link--active': isActive(link.to) }"
            @click="(e) => link.to.startsWith('/#') ? handleNavClick(e, link.to) : navigate(e)"
          >{{ link.label }}</a>
        </RouterLink>
      </nav>

      <!-- Actions -->
      <div class="app-navbar__actions">
        <AppThemeSwitcher />

        <a
          :href="APP_RESUME_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="resume-link hidden md:flex"
          aria-label="Download resume"
        >
          <i class="pi pi-download" style="font-size: 13px;" />
          <span>Resume</span>
        </a>

        <!-- Hamburger (mobile) -->
        <Button
          ref="hamburgerBtn"
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
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useUiStore } from '@/stores/ui.store'
import { NAV_LINKS, APP_NAME, APP_RESUME_URL } from '@/constants'
import AppThemeSwitcher from '@/components/layout/AppThemeSwitcher.vue'

const ui     = useUiStore()
const route  = useRoute()
const router = useRouter()
const scrolled = ref(false)
const hamburgerBtn = ref<{ $el: HTMLElement } | null>(null)

// Track which section is in view (only meaningful on homepage)
const activeSection = ref<string>('')

function updateActiveSection() {
  if (route.path !== '/') { activeSection.value = ''; return }
  const ids = ['skills', 'projects'] // page order: skills is above projects
  const mid = window.innerHeight / 2
  let active = ''
  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const { top } = el.getBoundingClientRect()
    if (top <= mid) active = id // last one whose top is above midpoint wins
  }
  activeSection.value = active
}

// Map hash links to their section id
const HASH_SECTION: Record<string, string> = {
  '/#projects': 'projects',
  '/#skills':   'skills',
}

function isActive(to: string): boolean {
  if (to.startsWith('/#')) {
    // Only active when on homepage AND that section is in view
    return route.path === '/' && activeSection.value === HASH_SECTION[to]
  }
  return route.path === to
}

// Scroll to a section by id, retrying until the element exists in the DOM
function scrollToSection(id: string, attempts = 0) {
  const el = document.getElementById(id)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top, behavior: 'smooth' })
    return
  }
  // Element not yet mounted (lazy section) — retry up to 20 times (2s total)
  if (attempts < 20) setTimeout(() => scrollToSection(id, attempts + 1), 100)
}

function handleNavClick(e: MouseEvent, to: string) {
  if (!to.startsWith('/#')) return // let RouterLink handle normal routes
  e.preventDefault()
  const id = to.slice(2) // '/#projects' → 'projects'
  if (route.path !== '/') {
    // Navigate to homepage first, then scroll after it mounts
    router.push('/').then(() => nextTick(() => scrollToSection(id)))
  } else {
    scrollToSection(id)
  }
}

// Return focus to hamburger when mobile menu closes
watch(() => ui.mobileMenuOpen, async (isOpen) => {
  if (!isOpen) {
    await nextTick()
    hamburgerBtn.value?.$el?.focus()
  }
})

function onScroll() {
  scrolled.value = window.scrollY > 20
  updateActiveSection()
}

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

.nav-link--active {
  color: #6366f1;
}

.nav-link:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.app-navbar__actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.resume-link {
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #a0a0a0;
  border: 1px solid #333333;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}

.resume-link:hover {
  border-color: #6366f1;
  color: #f5f5f5;
}

.resume-link:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
  border-radius: 6px;
}
</style>
