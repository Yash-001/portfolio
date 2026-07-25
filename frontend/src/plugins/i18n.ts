import type { App } from 'vue'
import { i18n } from '@/i18n'

export const i18nPlugin = {
  install(app: App) {
    app.use(i18n)
  },
}
