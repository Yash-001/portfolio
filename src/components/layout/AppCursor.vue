<template>
  <Teleport to="body">
    <div
      class="cursor-dot"
      :style="{ translate: `${x}px ${y}px`, opacity: visible ? 1 : 0 }"
    />
    <div
      class="cursor-ring"
      :style="{
        translate: `${rx}px ${ry}px`,
        scale: hovering ? '1.375' : '1',
        opacity: visible ? 1 : 0,
      }"
      :class="{ 'cursor-ring--hovering': hovering }"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const x = ref(-100); const y = ref(-100)
const rx = ref(-100); const ry = ref(-100)
const visible = ref(false)
const hovering = ref(false)

let rafId: number

function onMove(e: MouseEvent) {
  x.value = e.clientX
  y.value = e.clientY
  visible.value = true
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    rx.value = e.clientX
    ry.value = e.clientY
  })
}

function onOver(e: MouseEvent) {
  hovering.value = !!(e.target as HTMLElement).closest('a, button, [role="button"], [data-cursor-hover]')
}

function onLeave() { visible.value = false }

// Only mount on non-touch devices
const isTouch = window.matchMedia('(hover: none)').matches

onMounted(() => {
  if (isTouch) return
  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mouseover', onOver, { passive: true })
  document.documentElement.addEventListener('mouseleave', onLeave, { passive: true })
})

onUnmounted(() => {
  if (isTouch) return
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseover', onOver)
  document.documentElement.removeEventListener('mouseleave', onLeave)
  cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.cursor-dot,
.cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  border-radius: 50%;
  will-change: translate;
  transition: opacity 0.3s;
}

.cursor-dot {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  margin-left: -4px;
  margin-top: -4px;
}

.cursor-ring {
  width: 32px;
  height: 32px;
  border: 1.5px solid rgba(99, 102, 241, 0.5);
  border-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
  margin-left: -16px;
  margin-top: -16px;
  transition: opacity 0.3s, scale 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s;
}

.cursor-ring--hovering {
  border-color: color-mix(in srgb, var(--color-primary) 90%, transparent);
}
</style>
