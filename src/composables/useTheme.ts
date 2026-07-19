import { useUiStore } from '@/stores/ui.store'

export function useTheme() {
  const ui = useUiStore()
  onMounted(() => ui.initTheme())
  return { isDark: computed(() => ui.isDark), toggleTheme: ui.toggleTheme }
}
