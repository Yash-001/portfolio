import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useThemeStore } from '@/stores/theme.store'

export const useUiStore = defineStore('ui', () => {
  const themeStore   = useThemeStore()
  const isLoading    = ref(false)
  const loadingText  = ref('')
  const mobileMenuOpen = ref(false)

  // ── Backward-compat theme delegates ──────────────────────────────────────
  const isDark = computed(() => themeStore.isDark)

  function toggleTheme() { themeStore.toggleDark() }
  function initTheme()   { themeStore.initTheme() }

  // ── Loading ───────────────────────────────────────────────────────────────
  function setLoading(state: boolean, text = '') {
    isLoading.value   = state
    loadingText.value = text
  }

  // ── Mobile menu ───────────────────────────────────────────────────────────
  function closeMobileMenu()  { mobileMenuOpen.value = false }
  function toggleMobileMenu() { mobileMenuOpen.value = !mobileMenuOpen.value }

  return { isDark, isLoading, loadingText, mobileMenuOpen, toggleTheme, initTheme, setLoading, closeMobileMenu, toggleMobileMenu }
})
