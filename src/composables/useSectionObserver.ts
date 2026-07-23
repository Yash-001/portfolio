import { ref, onMounted, onUnmounted } from 'vue'
import { tracker, EVENTS } from '@/analytics'

/**
 * Fires once when a section shell enters the viewport, triggering lazy-mount.
 * Uses a generous rootMargin so sections near the bottom of the page still
 * trigger before the user reaches them (pre-mount buffer).
 */
export function useSectionObserver(
  ids: string[],
  rootMargin = '0px 0px 200px 0px',
) {
  const visible = ref<Set<string>>(new Set())
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            visible.value = new Set([...visible.value, e.target.id])
            tracker.track(EVENTS.SECTION_VIEW, { section: e.target.id })
            observer?.unobserve(e.target)
          }
        })
      },
      { rootMargin, threshold: 0 },
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer!.observe(el)
    })
  })

  onUnmounted(() => observer?.disconnect())

  function isVisible(id: string) {
    return visible.value.has(id)
  }

  return { visible, isVisible }
}
