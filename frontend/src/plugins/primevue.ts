import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import { DarkPreset } from '@/plugins/theme.presets'

export const primevue = {
  install(app: App) {
    app.use(PrimeVue, {
      theme: {
        preset: DarkPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: false,
        },
      },
      ripple: true,
    })
    app.use(ToastService)
    app.directive('tooltip', Tooltip)

    // Expose PrimeVue instance for theme store preset swapping
    app.config.globalProperties.$primevue = app.config.globalProperties.$primevue
    app.mixin({
      mounted() {
        if (this.$primevue && !(window as any).__primevue_instance__) {
          ;(window as any).__primevue_instance__ = this.$primevue
        }
      },
    })
  },
}
