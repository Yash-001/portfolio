import { gsap } from '@/plugins/gsap'

export function useTypewriter(el: Ref<HTMLElement | null>, words: string[], options?: {
  typingSpeed?: number
  deletingSpeed?: number
  pauseMs?: number
}) {
  const { typingSpeed = 0.06, deletingSpeed = 0.03, pauseMs = 2200 } = options ?? {}
  let tl: gsap.core.Timeline | null = null
  let idx = 0

  function buildTimeline() {
    if (!el.value) return
    tl?.kill()
    tl = gsap.timeline({ repeat: -1 })

    words.forEach((word) => {
      tl!
        .to(el.value!, {
          duration: word.length * typingSpeed,
          text: { value: word, delimiter: '' },
          ease: 'none',
        })
        .to({}, { duration: pauseMs / 1000 })
        .to(el.value!, {
          duration: word.length * deletingSpeed,
          text: { value: '', delimiter: '' },
          ease: 'none',
        })
        .to({}, { duration: 0.3 })
    })
  }

  onMounted(() => {
    nextTick(buildTimeline)
  })

  onUnmounted(() => tl?.kill())

  return { idx }
}
