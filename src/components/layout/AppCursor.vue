<template>
  <Teleport to="body">
    <div
      class="cursor-dot"
      :style="{ transform: `translate(${x}px, ${y}px)`, opacity: visible ? 1 : 0 }"
    />
    <div
      class="cursor-ring"
      :class="{ 'cursor-ring--hover': hovering }"
      :style="{ transform: `translate(${rx}px, ${ry}px)`, opacity: visible ? 1 : 0 }"
    />
  </Teleport>
</template>

<script setup lang="ts">
const x = ref(-100); const y = ref(-100)
const rx = ref(-100); const ry = ref(-100)
const visible = ref(false)
const hovering = ref(false)

let rafId: number

function onMove(e: MouseEvent) {
  x.value = e.clientX - 4
  y.value = e.clientY - 4
  visible.value = true
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    rx.value = e.clientX - 16
    ry.value = e.clientY - 16
  })
}

function onOver(e: MouseEvent) {
  hovering.value = !!(e.target as HTMLElement).closest('a, button, [role="button"], [data-cursor-hover]')
}

onMounted(() => {
  window.addEventListener('mousemove', onMove, { passive: true })
  window.addEventListener('mouseover', onOver, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseover', onOver)
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
  will-change: transform;
  transition: opacity 0.3s;
}

.cursor-dot {
  width: 8px;
  height: 8px;
  background: #6366f1;
}

.cursor-ring {
  width: 32px;
  height: 32px;
  border: 1.5px solid rgba(99, 102, 241, 0.5);
  transition: opacity 0.3s, width 0.2s, height 0.2s, border-color 0.2s;
}

.cursor-ring--hover {
  width: 44px;
  height: 44px;
  border-color: rgba(99, 102, 241, 0.9);
}
</style>
