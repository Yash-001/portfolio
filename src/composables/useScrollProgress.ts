import { ref, onMounted, onUnmounted } from 'vue'
import { tracker, EVENTS } from '@/analytics'

const DEPTH_THRESHOLDS = [25, 50, 75, 90, 100] as const
type Depth = typeof DEPTH_THRESHOLDS[number]

export function useScrollProgress() {
  const progress = ref(0)
  const fired    = new Set<Depth>()

  function onScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    const scrollable = scrollHeight - clientHeight
    const pct = scrollable > 0 ? Math.round((scrollTop / scrollable) * 100) : 0
    progress.value = pct

    for (const threshold of DEPTH_THRESHOLDS) {
      if (!fired.has(threshold) && pct >= threshold) {
        fired.add(threshold)
        tracker.track(EVENTS.SCROLL_DEPTH, { depth: threshold })
      }
    }
  }

  onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
  onUnmounted(() => window.removeEventListener('scroll', onScroll))

  return { progress }
}
