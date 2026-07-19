import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const isDark       = ref(true)
  const isLoading    = ref(false)
  const loadingText  = ref('')
  const mobileMenuOpen = ref(false)

  function toggleTheme() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  function initTheme() {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = stored ? stored === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function setLoading(state: boolean, text = '') {
    isLoading.value  = state
    loadingText.value = text
  }

  function closeMobileMenu() { mobileMenuOpen.value = false }
  function toggleMobileMenu() { mobileMenuOpen.value = !mobileMenuOpen.value }

  return { isDark, isLoading, loadingText, mobileMenuOpen, toggleTheme, initTheme, setLoading, closeMobileMenu, toggleMobileMenu }
})
