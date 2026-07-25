import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'

export function useCountUp(target: number, duration = 1.8, delay = 0) {
  const el    = ref<HTMLElement | null>(null)
  const value = ref(0)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!el.value) return
    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer?.disconnect()
        gsap.to(value, {
          duration,
          delay,
          value: target,
          ease: 'power2.out',
          snap: { value: 1 },
        })
      },
      { threshold: 0.4 },
    )
    observer.observe(el.value)
  })

  onUnmounted(() => observer?.disconnect())

  return { el, value }
}
