<template>
  <div
    ref="containerRef"
    class="theme-switcher"
  >
    <!-- Trigger button -->
    <button
      class="theme-switcher__trigger"
      :aria-label="t('common.aria.switchTheme')"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="open = !open"
    >
      <i :class="currentConfig.icon" class="theme-switcher__icon" />
      <span class="theme-switcher__label">{{ t(currentConfig.labelKey) }}</span>
      <i class="pi pi-chevron-down theme-switcher__chevron" :class="{ 'theme-switcher__chevron--open': open }" />
    </button>

    <!-- Dropdown -->
    <Transition name="theme-dropdown">
      <div
        v-if="open"
        class="theme-switcher__dropdown"
        role="listbox"
        :aria-label="t('common.aria.switchTheme')"
      >
        <button
          v-for="cfg in themes"
          :key="cfg.id"
          role="option"
          :aria-selected="cfg.id === activeTheme"
          class="theme-switcher__option"
          :class="{ 'theme-switcher__option--active': cfg.id === activeTheme }"
          @click="select(cfg.id)"
        >
          <i :class="cfg.icon" class="theme-switcher__option-icon" />
          <span class="theme-switcher__option-label">{{ t(cfg.labelKey) }}</span>
          <i
            v-if="cfg.id === activeTheme"
            class="pi pi-check theme-switcher__option-check"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme.store'
import { useLocale } from '@/composables/useLocale'
import type { ThemeId } from '@/types/theme.types'

const store = useThemeStore()
const { t } = useLocale()

const open         = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const activeTheme   = computed(() => store.activeTheme)
const currentConfig = computed(() => store.currentConfig)
const themes        = store.themes

function select(id: ThemeId) {
  store.setTheme(id)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.theme-switcher {
  position: relative;
}

.theme-switcher__trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 10px 0 8px;
  border-radius: 8px;
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.theme-switcher__trigger:hover {
  color: var(--text-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-muted);
}

.theme-switcher__trigger:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.theme-switcher__icon {
  font-size: 13px;
  flex-shrink: 0;
  color: var(--color-primary);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.theme-switcher__trigger:hover .theme-switcher__icon {
  transform: rotate(20deg);
}

.theme-switcher__label {
  font-size: 12px;
  font-weight: 500;
  color: inherit;
}

.theme-switcher__chevron {
  font-size: 9px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  opacity: 0.6;
}

.theme-switcher__chevron--open {
  transform: rotate(180deg);
}

/* ── Dropdown ─────────────────────────────────────────────────────────── */
.theme-switcher__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 400;
  min-width: 180px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 4px;
  box-shadow: var(--shadow-elevated);
  backdrop-filter: blur(var(--glass-blur, 0px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 0px));
}

.theme-switcher__option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}

.theme-switcher__option:hover {
  background: var(--bg-overlay);
  color: var(--text-primary);
}

.theme-switcher__option--active {
  color: var(--color-primary);
  background: var(--color-primary-muted);
}

.theme-switcher__option-icon {
  font-size: 13px;
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}

.theme-switcher__option-label {
  flex: 1;
}

.theme-switcher__option-check {
  font-size: 11px;
  color: var(--color-primary);
  flex-shrink: 0;
}

/* ── Transition ───────────────────────────────────────────────────────── */
.theme-dropdown-enter-active {
  transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.theme-dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.theme-dropdown-enter-from,
.theme-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
