<template>
  <div
    ref="wrapperEl"
    class="locale-switcher"
  >
    <button
      class="locale-switcher__trigger"
      type="button"
      :aria-label="`${t('common.aria.switchLang')}: ${currentLocale.labelEn}`"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="open = !open"
    >
      <span class="locale-switcher__flag">{{ currentLocale.flag }}</span>
      <span class="locale-switcher__code">{{ currentLocale.code.toUpperCase() }}</span>
      <i
        class="pi pi-chevron-down locale-switcher__chevron"
        :class="{ 'locale-switcher__chevron--open': open }"
      />
    </button>

    <Transition name="locale-dropdown">
      <ul
        v-if="open"
        class="locale-switcher__dropdown"
        role="listbox"
        :aria-label="t('common.aria.switchLang')"
      >
        <li
          v-for="loc in locales"
          :key="loc.code"
          role="option"
          :aria-selected="loc.code === locale"
          class="locale-switcher__option"
          :class="{ 'locale-switcher__option--active': loc.code === locale }"
          @click="select(loc.code)"
        >
          <span class="locale-switcher__flag">{{ loc.flag }}</span>
          <span class="locale-switcher__label">{{ loc.label }}</span>
          <i
            v-if="loc.code === locale"
            class="pi pi-check locale-switcher__check"
          />
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import type { LocaleCode } from '@/types/i18n.types'

const { t, locale, currentLocale, setLocale, locales } = useLocale()

const open      = ref(false)
const wrapperEl = ref<HTMLElement | null>(null)

async function select(code: LocaleCode) {
  open.value = false
  if (code !== locale.value) await setLocale(code)
}

function onClickOutside(e: MouseEvent) {
  if (wrapperEl.value && !wrapperEl.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(()   => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.locale-switcher {
  position: relative;
}

.locale-switcher__trigger {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-active);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  font-family: 'Geist Mono', monospace;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  letter-spacing: 0.04em;
}

.locale-switcher__trigger:hover {
  border-color: var(--color-primary);
  color: var(--text-primary);
}

.locale-switcher__trigger:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.locale-switcher__flag { font-size: 14px; line-height: 1; }

.locale-switcher__chevron {
  font-size: 10px;
  transition: transform 0.2s;
}
.locale-switcher__chevron--open { transform: rotate(180deg); }

.locale-switcher__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 300;
  min-width: 160px;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: var(--shadow-elevated);
  list-style: none;
  margin: 0;
}

.locale-switcher__option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: background 0.15s, color 0.15s;
}

.locale-switcher__option:hover {
  background: var(--color-primary-muted);
  color: var(--text-primary);
}

.locale-switcher__option--active {
  color: var(--color-primary);
}

.locale-switcher__label { flex: 1; }

.locale-switcher__check {
  font-size: 11px;
  color: var(--color-primary);
}

/* Dropdown transition */
.locale-dropdown-enter-active,
.locale-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.locale-dropdown-enter-from,
.locale-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
