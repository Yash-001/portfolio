import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Fires a callback once when an element enters the viewport.
 * Used to trigger lazy-mount of heavy sections.
 */
export function useSectionObserver(
  ids: string[],
  rootMargin = '0px 0px -10% 0px',
) {
  const visible = ref<Set<string>>(new Set())
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            visible.value = new Set([...visible.value, e.target.id])
            observer?.unobserve(e.target) // fire once
          }
        })
      },
      { rootMargin, threshold: 0.05 },
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
