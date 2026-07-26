import type { App } from 'vue'
import { tracker } from '@/analytics/tracker'
import { router }  from '@/router'

export const analyticsPlugin = {
  install(_app: App): void {
    tracker.init()

    // Automatic page view on every route change
    let lastTrackedPath = ''
    router.afterEach((to) => {
      // Prevent duplicate page_view for the same path (e.g. query-only changes)
      if (to.path === lastTrackedPath) return
      lastTrackedPath = to.path
      const title = String(to.meta.title ?? document.title ?? to.path)
      tracker.page(to.path, title)
    })
  },
}
