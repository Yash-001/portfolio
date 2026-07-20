import type { App } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { TextPlugin } from 'gsap/TextPlugin'
import { router } from '@/router'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin)

export { gsap, ScrollTrigger }

export const gsapPlugin = {
  install(_app: App) {
    ScrollTrigger.defaults({
      markers: false,
      once:    true,
    })

    // Kill all ScrollTrigger instances before navigation begins —
    // before the out-in transition starts and before any component unmounts.
    // This prevents scrub/scroll listeners from the old page surviving
    // into the new page's lifecycle.
    router.beforeEach((_to, _from, next) => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
      ScrollTrigger.clearScrollMemory()
      next()
    })

    // After the new page has fully mounted and the transition is done,
    // refresh ScrollTrigger so it measures the new page's layout correctly.
    router.afterEach(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => ScrollTrigger.refresh())
      })
    })
  },
}
