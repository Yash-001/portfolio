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
    })

    router.beforeEach((_to, _from, next) => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
      ScrollTrigger.clearScrollMemory()
      next()
    })

    router.afterEach(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => ScrollTrigger.refresh())
      })
    })
  },
}
