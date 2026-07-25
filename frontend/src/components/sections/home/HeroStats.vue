<template>
  <div class="hero-stats">
    <div
      v-for="(stat, i) in STATS"
      :key="stat.label"
      class="stat-card"
    >
      <div class="stat-card__value">
        <span
          :ref="(el) => { statEls[i] = el as HTMLElement | null }"
          class="stat-number"
        >0</span>
        <span class="stat-suffix">{{ stat.suffix }}</span>
      </div>
      <p class="stat-card__label">
        {{ stat.label }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from '@/plugins/gsap'
import { STATS } from '@/constants'

const statEls: (HTMLElement | null)[] = []
let statObserver: IntersectionObserver | null = null

onMounted(() => {
  statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const idx = statEls.indexOf(entry.target as HTMLElement)
        if (idx === -1) return
        const target = STATS[idx].value
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          delay: idx * 0.12,
          ease: 'power2.out',
          snap: { val: 1 },
          onUpdate() {
            if (statEls[idx]) {
              statEls[idx]!.textContent = String(Math.round(obj.val))
            }
          },
        })
        statObserver!.unobserve(entry.target)
      })
    },
    { threshold: 0.4 },
  )

  nextTick(() => {
    statEls.forEach((el) => el && statObserver!.observe(el))
  })
})

onUnmounted(() => statObserver?.disconnect())
</script>

<style scoped>
/* Always 2-col — profile card is 380px max, 4-col makes cards too narrow */
.hero-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-card {
  position: relative;
  padding: 14px 12px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 15%, transparent);
  background: var(--bg-primary);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  text-align: center;
  transition: border-color 0.3s, background-color 0.3s;
}

.stat-card:hover {
  border-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
}

.stat-card__value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-number {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.stat-suffix {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-card__label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  line-height: 1.3;
}
</style>
