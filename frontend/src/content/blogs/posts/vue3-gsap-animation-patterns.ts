import type { BlogPostFull } from '@/types/content'
import { BLOG_AUTHOR } from '../author'

const post: BlogPostFull = {
  id:          'blog-6',
  slug:        'vue3-gsap-animation-patterns',
  title:       'Production Animation Patterns in Vue 3 with GSAP',
  excerpt:     'The animation patterns I use across every Vue 3 project: gsap.context() for cleanup, ScrollTrigger with once:true, 3D tilt on mousemove, and conic-gradient borders that follow the cursor. All production-tested.',
  category:    'Frontend',
  author:      BLOG_AUTHOR,
  tags:        [{ name: 'Vue 3', slug: 'vue3' }, { name: 'GSAP', slug: 'gsap' }, { name: 'Animation', slug: 'animation' }],
  status:      'published',
  featured:    false,
  readingTime: 9,
  publishedAt: '2023-12-18',
  coverImage:  undefined,
  content: `
## Why GSAP Over CSS Animations

CSS animations are fine for simple transitions — hover states, fades, basic slides. Once you need sequencing, scroll-triggered reveals, or anything that responds to user interaction in real time, CSS becomes painful. You end up fighting specificity, managing animation classes manually, and writing JavaScript anyway to handle the timing.

GSAP gives you a proper timeline API, reliable cross-browser behaviour, and performance that's hard to match with CSS alone. The learning curve is low if you already know CSS transforms — the mental model maps directly.

These are the patterns I've settled on after using GSAP across a few Vue 3 projects. Some of them I learned the hard way — memory leaks in production, animations that kept running after navigation, scroll triggers firing at the wrong time.

---

## Pattern 1: gsap.context() for Cleanup

The most important pattern. If you create GSAP animations in a component without cleaning them up, you'll get memory leaks and animations that keep running after the component unmounts. This is especially bad in SPAs where components mount and unmount frequently.

\`gsap.context()\` scopes all animations created inside it to a specific DOM element. When you call \`.revert()\` on the context, it kills all animations and reverts all inline styles. Clean slate.

\`\`\`vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const container = ref<HTMLElement | null>(null)
let ctx: gsap.Context

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.card', {
      opacity: 0,
      y: 30,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
    })
  }, container.value!)
})

onUnmounted(() => ctx.revert())
</script>

<template>
  <div ref="container">
    <div class="card" v-for="item in items" :key="item.id">...</div>
  </div>
</template>
\`\`\`

The selector \`.card\` inside \`gsap.context()\` is scoped to \`container.value\` — it won't accidentally target \`.card\` elements in other components. This matters in complex layouts where the same class names appear in multiple places.

I use this pattern in every component that has GSAP animations. Skipping it has burned me before.

---

## Pattern 2: ScrollTrigger with once: true

Scroll-triggered entrance animations should fire once. If a user scrolls down, sees the animation, scrolls back up, and scrolls down again — the animation shouldn't replay. It looks cheap and distracts from the content.

\`\`\`vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const section = ref<HTMLElement | null>(null)
let ctx: gsap.Context

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.reveal-item', {
      opacity: 0,
      y: 40,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.reveal-item',
        start: 'top 85%',
        once: true,       // fires once, then ScrollTrigger kills itself
      },
    })
  }, section.value!)
})

onUnmounted(() => ctx.revert())
</script>
\`\`\`

\`start: 'top 85%'\` means the animation triggers when the top of the element reaches 85% down the viewport — just before it's fully visible. This feels natural. If you use \`top 100%\`, the animation fires the moment the element enters the viewport at the very bottom, which often feels too early.

\`once: true\` is the key. Without it, ScrollTrigger keeps watching the element and re-triggers on every scroll-into-view. With it, the trigger is removed after the first fire.

One thing to watch: if you have many ScrollTrigger instances on a page, they add up. I batch them where possible — one ScrollTrigger for a section rather than one per element.

---

## Pattern 3: 3D Tilt on Mousemove

This is the card tilt effect — the card rotates slightly in 3D to follow the mouse cursor. It's a small detail but it makes cards feel physical and interactive.

\`\`\`vue
<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'

const card = ref<HTMLElement | null>(null)

function onMouseMove(e: MouseEvent) {
  const el = card.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const cx = rect.width / 2
  const cy = rect.height / 2

  const rotateX = ((y - cy) / cy) * -8   // max 8deg
  const rotateY = ((x - cx) / cx) * 8

  gsap.to(el, {
    rotateX,
    rotateY,
    transformPerspective: 800,
    duration: 0.3,
    ease: 'power2.out',
  })
}

function onMouseLeave() {
  gsap.to(card.value, {
    rotateX: 0,
    rotateY: 0,
    duration: 0.5,
    ease: 'power3.out',
  })
}
</script>

<template>
  <div
    ref="card"
    class="card"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    style="transform-style: preserve-3d;"
  >
    <slot />
  </div>
</template>
\`\`\`

A few things that matter here:

- \`transformPerspective: 800\` — lower values make the tilt more dramatic, higher values flatten it. 800 is subtle enough to feel natural.
- Max rotation of 8 degrees — more than this starts to look exaggerated.
- The \`onMouseLeave\` eases back to flat with a slightly longer duration than the tilt. This makes the reset feel smooth rather than snapping back.
- \`transform-style: preserve-3d\` on the container is required for child elements to participate in the 3D space. Without it, the tilt applies to the container but children render flat.

---

## Pattern 4: Conic-Gradient Border That Follows the Cursor

This is the glowing border effect where a highlight follows the mouse around the edge of a card. It's done with a conic gradient on a pseudo-element, rotated based on the cursor angle relative to the card centre.

\`\`\`vue
<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'

const card = ref<HTMLElement | null>(null)

function onMouseMove(e: MouseEvent) {
  const el = card.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  const angle = Math.atan2(y, x) * (180 / Math.PI)

  gsap.to(el, {
    '--gradient-angle': \`\${angle}deg\`,
    duration: 0.1,
    ease: 'none',
  })
}

function onMouseLeave() {
  gsap.to(card.value, {
    '--gradient-angle': '0deg',
    duration: 0.6,
    ease: 'power2.out',
  })
}
</script>

<template>
  <div
    ref="card"
    class="glow-card"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <slot />
  </div>
</template>

<style scoped>
.glow-card {
  position: relative;
  --gradient-angle: 0deg;
  border-radius: 12px;
  background: #0f0f0f;
}

.glow-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--gradient-angle),
    transparent 60%,
    rgba(99, 102, 241, 0.8) 80%,
    transparent 100%
  );
  z-index: -1;
}
</style>
\`\`\`

GSAP can animate CSS custom properties directly — \`--gradient-angle\` is a CSS variable, and GSAP tweens it like any other numeric value. This is cleaner than updating the style attribute manually in the event handler.

The \`duration: 0.1\` on the mousemove handler keeps the gradient responsive without being jittery. \`ease: 'none'\` is intentional — easing on a value that's already being continuously updated by mouse movement creates lag.

The \`::before\` pseudo-element sits behind the card content (\`z-index: -1\`) and extends 1px beyond the card edges (\`inset: -1px\`). The conic gradient creates a sweep of colour that rotates as the angle changes.

---

## Pattern 5: Page Transition with Vue Router

Route transitions are where GSAP and Vue's \`<Transition>\` component work well together. The key is using the JavaScript hooks (\`onEnter\`, \`onLeave\`) rather than CSS classes, so GSAP controls the timing.

\`\`\`vue
<!-- AppLayout.vue -->
<template>
  <RouterView v-slot="{ Component }">
    <Transition
      :css="false"
      @enter="onEnter"
      @leave="onLeave"
    >
      <component :is="Component" :key="$route.path" />
    </Transition>
  </RouterView>
</template>

<script setup lang="ts">
import gsap from 'gsap'

function onEnter(el: Element, done: () => void) {
  gsap.from(el, {
    opacity: 0,
    y: 20,
    duration: 0.35,
    ease: 'power2.out',
    onComplete: done,
  })
}

function onLeave(el: Element, done: () => void) {
  gsap.to(el, {
    opacity: 0,
    y: -20,
    duration: 0.25,
    ease: 'power2.in',
    onComplete: done,
  })
}
</script>
\`\`\`

\`:css="false"\` tells Vue not to apply any CSS transition classes — GSAP handles everything. The \`done\` callback is critical: Vue waits for it before removing the leaving element from the DOM. If you forget to call \`done\` in \`onComplete\`, the leaving element stays in the DOM indefinitely.

The leave animation is slightly faster than the enter (0.25s vs 0.35s). This is intentional — you want the old page to get out of the way quickly so the new one can come in. If both are the same duration, the transition feels sluggish.

---

## Things I've Stopped Doing

**Animating on every scroll event directly.** I used to attach \`window.addEventListener('scroll', ...)\` and update GSAP values in the handler. ScrollTrigger handles this better — it uses IntersectionObserver under the hood and is more performant.

**Using \`v-if\` to trigger entrance animations.** Mounting a component and immediately animating it from \`opacity: 0\` causes a flash of invisible content before the animation starts. I use \`v-show\` with an initial \`opacity: 0\` style, then animate in \`onMounted\`. Or I use ScrollTrigger so the animation only fires when the element is actually in view.

**Forgetting \`will-change: transform\` on heavily animated elements.** For elements that animate continuously (like the tilt card), adding \`will-change: transform\` promotes them to their own compositor layer and prevents repaints. Don't add it to everything — it uses GPU memory — but for elements that are always animating, it's worth it.
`,
}

export default post
