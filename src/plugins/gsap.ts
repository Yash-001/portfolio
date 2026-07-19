import type { App } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin)

export { gsap, ScrollTrigger }

export const gsapPlugin = {
  install(_app: App) {
    ScrollTrigger.defaults({
      markers:   false,
      once:      true,
    })
  },
}
