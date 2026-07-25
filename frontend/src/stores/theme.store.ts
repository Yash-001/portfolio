import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ThemeId, ResolvedThemeId } from '@/types/theme.types'
import { THEMES, THEME_LIST } from '@/constants/theme.constants'
import {
  persistTheme,
  getPersistedTheme,
  resolveAutoTheme,
  applyThemeToDom,
} from '@/utils/theme.utils'
import { PRIMEVUE_PRESETS } from '@/plugins/theme.presets'

const TRANSITION_DURATION = 300 // ms — matches --theme-transition-duration

export const useThemeStore = defineStore('theme', () => {
  const activeTheme     = ref<ThemeId>('dark')
  const resolvedTheme   = ref<ResolvedThemeId>('dark')
  const isTransitioning = ref(false)

  let _systemWatcher: MediaQueryList | null = null
  let _systemHandler: (() => void) | null   = null

  // ── Getters ──────────────────────────────────────────────────────────────
  const isDark        = computed(() => THEMES[resolvedTheme.value].isDark)
  const currentConfig = computed(() => THEMES[resolvedTheme.value])
  const themes        = THEME_LIST

  // ── Internal: swap PrimeVue preset ───────────────────────────────────────
  function _swapPrimeVuePreset(id: ResolvedThemeId): void {
    try {
      // PrimeVue 4 exposes $primevue on globalProperties
      const pv = (window as any).__primevue_instance__
      if (pv?.changeTheme) {
        const prev = PRIMEVUE_PRESETS[resolvedTheme.value]
        const next = PRIMEVUE_PRESETS[id]
        pv.changeTheme(prev, next, 'primevue-theme-link', () => {})
      }
    } catch { /* PrimeVue not yet mounted — first init handles it */ }
  }

  // ── Internal: apply resolved theme ───────────────────────────────────────
  function _apply(id: ResolvedThemeId): void {
    _swapPrimeVuePreset(id)
    applyThemeToDom(id)
    resolvedTheme.value = id
  }

  // ── Internal: system theme watcher ───────────────────────────────────────
  function _startSystemWatcher(): void {
    _stopSystemWatcher()
    _systemWatcher = window.matchMedia('(prefers-color-scheme: dark)')
    _systemHandler = () => {
      if (activeTheme.value === 'auto') _apply(resolveAutoTheme())
    }
    _systemWatcher.addEventListener('change', _systemHandler)
  }

  function _stopSystemWatcher(): void {
    if (_systemWatcher && _systemHandler) {
      _systemWatcher.removeEventListener('change', _systemHandler)
    }
    _systemWatcher = null
    _systemHandler = null
  }

  // ── Public: set theme with animated transition ────────────────────────────
  async function setTheme(id: ThemeId): Promise<void> {
    if (id === activeTheme.value) return

    activeTheme.value = id
    persistTheme(id)

    const resolved: ResolvedThemeId = id === 'auto' ? resolveAutoTheme() : id

    if (id === 'auto') {
      _startSystemWatcher()
    } else {
      _stopSystemWatcher()
    }

    // ── Animated transition ───────────────────────────────────────────────
    isTransitioning.value = true
    document.documentElement.classList.add('theme-transitioning')

    const useViewTransition =
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (useViewTransition) {
      await (document as any).startViewTransition(() => {
        _apply(resolved)
      }).ready
    } else {
      _apply(resolved)
    }

    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
      isTransitioning.value = false
    }, TRANSITION_DURATION)
  }

  // ── Public: toggle dark ↔ light (backward compat) ────────────────────────
  function toggleDark(): void {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  // ── Public: init (called once in App.vue onMounted) ───────────────────────
  function initTheme(): void {
    const persisted = getPersistedTheme()
    const initial: ThemeId = persisted ?? 'auto'
    activeTheme.value = initial

    const resolved: ResolvedThemeId =
      initial === 'auto' ? resolveAutoTheme() : initial

    if (initial === 'auto') _startSystemWatcher()

    // Apply immediately — no transition on first paint
    applyThemeToDom(resolved)
    resolvedTheme.value = resolved
  }

  return {
    activeTheme,
    resolvedTheme,
    isTransitioning,
    isDark,
    currentConfig,
    themes,
    setTheme,
    toggleDark,
    initTheme,
  }
})
