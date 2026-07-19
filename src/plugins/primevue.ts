import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

const PortfolioPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#EEEEFF',
      100: '#E0E0FF',
      200: '#C7C8FF',
      300: '#A5A6FF',
      400: '#8183FF',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
      950: '#1E1B4B',
    },
    colorScheme: {
      dark: {
        surface: {
          0:   '#FFFFFF',
          50:  '#F5F5F5',
          100: '#E5E5E5',
          200: '#A0A0A0',
          300: '#737373',
          400: '#555555',
          500: '#404040',
          600: '#333333',
          700: '#222222',
          800: '#1A1A1A',
          900: '#111111',
          950: '#0A0A0A',
        },
      },
    },
  },
})

export const primevue = {
  install(app: App) {
    app.use(PrimeVue, {
      theme: {
        preset: PortfolioPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: false,
        },
      },
      ripple: true,
    })
    app.use(ToastService)
    app.directive('tooltip', Tooltip)
  },
}
