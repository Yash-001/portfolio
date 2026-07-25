import type { App } from 'vue'
import { tracker } from '@/analytics/tracker'
import { router }  from '@/router'

export const analyticsPlugin = {
  install(_app: App): void {
    tracker.init()

    // Automatic page view on every route change
    router.afterEach((to) => {
      const title = String(to.meta.title ?? document.title ?? to.path)
      tracker.page(to.path, title)
    })
  },
}
