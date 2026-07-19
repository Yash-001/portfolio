<template>
  <div class="hero-bg" aria-hidden="true">
    <!-- Radial gradient orbs -->
    <div class="orb orb--primary" />
    <div class="orb orb--violet" />
    <div class="orb orb--cyan" />

    <!-- Particle canvas -->
    <canvas ref="canvasEl" class="hero-bg__canvas" />

    <!-- Grid overlay -->
    <div class="hero-bg__grid" />

    <!-- Bottom fade -->
    <div class="hero-bg__fade" />
  </div>
</template>

<script setup lang="ts">
const canvasEl = ref<HTMLCanvasElement | null>(null)

interface Particle {
  x: number; y: number
  vx: number; vy: number
  r: number; alpha: number
}

onMounted(() => {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  let raf: number
  let W = 0, H = 0
  const PARTICLE_COUNT = 80
  const CONNECTION_DIST = 140
  const particles: Particle[] = []

  function resize() {
    W = canvas.width  = canvas.offsetWidth
    H = canvas.height = canvas.offsetHeight
  }

  function spawn(): Particle {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }
  }

  function init() {
    particles.length = 0
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(spawn())
  }

  function draw() {
    ctx.clearRect(0, 0, W, H)

    // Update + draw particles
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy
      if (p.x < 0) p.x = W
      if (p.x > W) p.x = 0
      if (p.y < 0) p.y = H
      if (p.y > H) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(99,102,241,${p.alpha})`
      ctx.fill()
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(99,102,241,${alpha})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }
    }

    raf = requestAnimationFrame(draw)
  }

  const ro = new ResizeObserver(() => { resize(); init() })
  ro.observe(canvas)
  resize(); init(); draw()

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    ro.disconnect()
  })
})
</script>

<style scoped>
.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.hero-bg__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Gradient orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}

.orb--primary {
  width: 600px;
  height: 600px;
  top: -200px;
  left: 50%;
  transform: translateX(-30%);
  background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
  animation: orbFloat1 12s ease-in-out infinite;
}

.orb--violet {
  width: 400px;
  height: 400px;
  top: 10%;
  right: -100px;
  background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
  animation: orbFloat2 16s ease-in-out infinite;
}

.orb--cyan {
  width: 300px;
  height: 300px;
  bottom: 20%;
  left: -80px;
  background: radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%);
  animation: orbFloat3 20s ease-in-out infinite;
}

@keyframes orbFloat1 {
  0%, 100% { transform: translateX(-30%) translateY(0px); }
  50%       { transform: translateX(-30%) translateY(-40px); }
}
@keyframes orbFloat2 {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(30px) rotate(10deg); }
}
@keyframes orbFloat3 {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-20px); }
}

/* Subtle dot grid */
.hero-bg__grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(99,102,241,0.08) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%);
}

/* Bottom fade into page */
.hero-bg__fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to bottom, transparent, #0a0a0a);
}
</style>
