<template>
  <Drawer
    v-model:visible="open"
    position="right"
    :pt="pt"
    class="app-mobile-menu"
  >
    <template #header>
      <span class="font-mono text-label-md tracking-widest text-content-secondary uppercase">{{ t('common.aria.mobileMenu') }}</span>
    </template>

    <nav class="flex flex-col gap-1 mt-4">
      <RouterLink
        v-for="link in FOOTER_LINKS"
        :key="link.to"
        :to="link.to"
        class="mobile-nav-link"
        @click="ui.closeMobileMenu()"
      >
        {{ link.label }}
      </RouterLink>
    </nav>

    <Divider class="my-6" />

    <div class="flex items-center gap-3">
      <a
        v-for="s in SOCIAL_LINKS_NAV"
        :key="s.platform"
        :href="s.url"
        :aria-label="s.label"
        target="_blank"
        rel="noopener noreferrer"
        class="social-icon-btn"
      >
        <i :class="s.icon" />
      </a>
    </div>

    <template #footer>
      <p class="text-body-xs text-content-tertiary font-mono">
        © {{ year }} {{ APP_NAME }}
      </p>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue'
import Drawer from 'primevue/drawer'
import Divider from 'primevue/divider'
import { useUiStore } from '@/stores/ui.store'
import { FOOTER_LINKS, SOCIAL_LINKS_NAV } from '@/constants'
import { APP_NAME } from '@/constants'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()

const ui   = useUiStore()
const open = computed({
  get: () => ui.mobileMenuOpen,
  set: (v: boolean) => { if (!v) ui.closeMobileMenu() },
})
const year = new Date().getFullYear()

// Lock body scroll when menu is open
watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

// Restore scroll if component unmounts while menu is open
onUnmounted(() => { document.body.style.overflow = '' })

const pt = {
  root:    { class: 'app-mobile-menu__root' },
  content: { class: 'app-mobile-menu__content' },
}
</script>

<style scoped>
.mobile-nav-link {
  display: block;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  color: var(--p-surface-200);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
}
.mobile-nav-link:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.social-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--p-surface-700);
  color: var(--p-surface-300);
  transition: border-color 0.2s, color 0.2s;
}
.social-icon-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
}
</style>

<style>
.app-mobile-menu__root {
  background: #111111 !important;
  border-left: 1px solid #222222 !important;
  width: min(320px, 85vw) !important;
}
</style>
