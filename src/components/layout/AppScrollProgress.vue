<template>
  <div
    class="scroll-progress"
    role="progressbar"
    :aria-valuenow="progress"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="scroll-progress__bar"
      :style="{ width: `${progress}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { useScrollProgress } from '@/composables/useScrollProgress'
const { progress } = useScrollProgress()
</script>

<style scoped>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9998;
  height: 2px;
  background: transparent;
  pointer-events: none;
}

.scroll-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  transition: width 0.1s linear;
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-primary) 60%, transparent);
}
</style>
