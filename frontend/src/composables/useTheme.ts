import { useThemeStore } from '@/stores/theme.store'

export function useTheme() {
  const store = useThemeStore()
  return {
    // State
    theme:          store.activeTheme,
    resolvedTheme:  store.resolvedTheme,
    isTransitioning: store.isTransitioning,
    // Getters
    isDark:         store.isDark,
    currentConfig:  store.currentConfig,
    themes:         store.themes,
    // Actions
    setTheme:       store.setTheme,
    toggleDark:     store.toggleDark,
    // Backward compat
    toggleTheme:    store.toggleDark,
  }
}
