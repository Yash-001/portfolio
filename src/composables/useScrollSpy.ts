import { ref, onMounted, onUnmounted } from 'vue'

export interface ScrollSpyOptions {
  sectionIds: string[]
  offset?: number
  rootMargin?: string
}

export function useScrollSpy(options: ScrollSpyOptions) {
  const { sectionIds, rootMargin = '-20% 0px -70% 0px' } = options
  const activeSection = ref<string>(sectionIds[0] ?? '')

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeSection.value = entry.target.id
          }
        }
      },
      { rootMargin, threshold: 0 },
    )

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer!.observe(el)
    })
  })

  onUnmounted(() => observer?.disconnect())

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return { activeSection, scrollTo }
}
