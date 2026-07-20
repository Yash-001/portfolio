import { computed } from 'vue'
import { useUiStore } from '@/stores/ui.store'

export function useTheme() {
  const ui = useUiStore()
  // initTheme is called once in App.vue onMounted — do not call it here
  return { isDark: computed(() => ui.isDark), toggleTheme: ui.toggleTheme }
}
