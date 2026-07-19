export function useScrollProgress() {
  const progress = ref(0)

  function onScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    const scrollable = scrollHeight - clientHeight
    progress.value = scrollable > 0 ? Math.round((scrollTop / scrollable) * 100) : 0
  }

  onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
  onUnmounted(() => window.removeEventListener('scroll', onScroll))

  return { progress }
}
