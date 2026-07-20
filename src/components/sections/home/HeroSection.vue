<template>
  <section
    id="hero"
    class="hero"
    aria-label="Introduction"
  >
    <HeroBackground />

    <div class="hero__inner">
      <!-- LEFT COLUMN -->
      <div
        ref="leftCol"
        class="hero__left"
      >
        <!-- Availability badge -->
        <div class="hero__badge reveal-item">
          <span class="badge-dot" />
          <span class="font-mono text-label-md text-success-400 tracking-widest uppercase">
            {{ APP_AVAILABILITY_TEXT }}
          </span>
        </div>

        <!-- Headline -->
        <div class="hero__headline">
          <h1 class="reveal-item">
            <span class="block text-content-secondary text-heading-sm font-mono tracking-widest uppercase mb-2">
              Hi, I'm
            </span>
            <span class="hero__name reveal-item">{{ APP_NAME }}</span>
          </h1>

          <!-- Typewriter role line -->
          <div
            class="hero__role reveal-item"
            aria-label="Role"
          >
            <span class="hero__role-prefix">I build&nbsp;</span>
            <span
              ref="typewriterEl"
              class="hero__role-typed"
            />
            <span
              class="hero__cursor"
              aria-hidden="true"
            >|</span>
          </div>
        </div>

        <!-- Subheadline -->
        <p class="hero__sub reveal-item">
          Seven years deep in enterprise systems — Java, Spring Boot, AWS, Vue.
          I care about the code that runs at 3 AM and doesn't wake anyone up.
        </p>

        <!-- Tech stack pills -->
        <div
          class="hero__stack reveal-item"
          aria-label="Core technologies"
        >
          <span
            v-for="tech in TECH_STACK"
            :key="tech"
            class="tech-pill"
          >{{ tech }}</span>
        </div>

        <!-- CTA row -->
        <div class="hero__cta reveal-item">
          <RouterLink
            to="/contact"
            class="hero__btn-primary"
            aria-label="Hire Me"
          >
            <i class="pi pi-send" aria-hidden="true" />
            <span>Hire Me</span>
          </RouterLink>

          <a
            :href="APP_RESUME_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="hero__btn-outline"
            aria-label="Download resume"
          >
            <i class="pi pi-download" aria-hidden="true" />
            <span>Resume</span>
          </a>
        </div>

        <!-- Social links -->
        <div
          class="hero__social reveal-item"
          aria-label="Social links"
        >
          <a
            v-for="s in SOCIAL_LINKS_NAV"
            :key="s.platform"
            :href="s.url"
            :aria-label="s.label"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
          >
            <i :class="s.icon" />
            <span>{{ s.label }}</span>
          </a>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div
        ref="rightCol"
        class="hero__right"
      >
        <!-- Profile card -->
        <div class="profile-card reveal-item">
          <!-- Glow ring -->
          <div
            class="profile-card__glow"
            aria-hidden="true"
          />

          <!-- Avatar -->
          <div class="profile-card__avatar">
            <img
              v-if="PROFILE_IMAGE"
              :src="PROFILE_IMAGE"
              :alt="APP_NAME"
              class="avatar-img"
            />
            <div
              v-else
              class="avatar-placeholder"
              aria-label="Profile photo placeholder"
            >
              <i
                class="pi pi-user"
                style="font-size: 3rem; color: #6366f1;"
              />
            </div>
            <div
              class="avatar-ring"
              aria-hidden="true"
            />
          </div>

          <!-- Identity -->
          <div class="profile-card__identity">
            <p class="profile-card__name">
              {{ APP_NAME }}
            </p>
            <p class="profile-card__title font-mono">
              {{ APP_TITLE }}
            </p>
          </div>

          <!-- Location + time -->
          <div class="profile-card__meta">
            <span class="meta-item">
              <i class="pi pi-map-marker" />
              {{ APP_LOCATION }}
            </span>
            <span class="meta-item">
              <i class="pi pi-clock" />
              <span
                ref="clockEl"
                class="font-mono"
              >{{ currentTime }}</span>
            </span>
          </div>

          <!-- Divider -->
          <div class="profile-card__divider" />

          <!-- Mini stats -->
          <HeroStats />

          <!-- Open to work tag -->
          <div class="profile-card__open">
            <span class="open-dot" />
            <span class="font-mono text-label-sm text-content-secondary">
              Open to new projects · Responds in {{ APP_RESPONSE_TIME }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div
      class="hero__scroll-hint"
      aria-hidden="true"
    >
      <span class="font-mono text-label-sm text-content-tertiary tracking-widest uppercase">Scroll</span>
      <div class="scroll-line">
        <div class="scroll-line__inner" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'
import HeroBackground from './HeroBackground.vue'
import HeroStats from './HeroStats.vue'
import { useTypewriter } from '@/composables/useTypewriter'
import {
  APP_NAME, APP_TITLE, APP_LOCATION, APP_AVAILABILITY_TEXT, APP_RESPONSE_TIME, APP_RESUME_URL,
} from '@/constants'
import { SOCIAL_LINKS_NAV } from '@/constants'
import { PROFILE_IMAGE } from '@/config/portfolio.config'

const TECH_STACK = ['Java', 'Spring Boot', 'Vue 3', 'AWS', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis']

const ROLES = [
  'enterprise backends.',
  'cloud infrastructure.',
  'AI-assisted systems.',
  'things that scale.',
  'the code that ships.',
]

const leftCol      = ref<HTMLElement | null>(null)
const rightCol     = ref<HTMLElement | null>(null)
const typewriterEl = ref<HTMLElement | null>(null)
const currentTime  = ref('')

useTypewriter(typewriterEl, ROLES, { typingSpeed: 0.055, deletingSpeed: 0.028, pauseMs: 2400 })

// Live clock
let clockInterval: ReturnType<typeof setInterval>
let gsapCtx: ReturnType<typeof gsap.context> | null = null

function updateClock() {
  currentTime.value = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)

  const items = leftCol.value?.querySelectorAll('.reveal-item') ?? []
  gsapCtx = gsap.context(() => {
    gsap.fromTo(
      items,
      { opacity: 0, y: 28 },
      {
        opacity: 1, y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.15,
        clearProps: 'transform',
      },
    )

    gsap.fromTo(
      rightCol.value,
      { opacity: 0, x: 48 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.4, clearProps: 'transform' },
    )
  }, leftCol.value!)
})

onUnmounted(() => {
  clearInterval(clockInterval)
  gsapCtx?.revert()
})
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  background: #0a0a0a;
}

.hero__inner {
  position: relative;
  z-index: 10;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 120px 24px 80px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 64px;
  align-items: center;
}

@media (min-width: 1024px) {
  .hero__inner {
    grid-template-columns: 1fr 420px;
    gap: 80px;
  }
}

/* ── LEFT ── */
.hero__left {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  border: 1px solid rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.06);
  width: fit-content;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  animation: pulseDot 2s ease-in-out infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}

.hero__headline { display: flex; flex-direction: column; gap: 12px; }

.hero__name {
  display: block;
  font-size: clamp(44px, 6vw, 72px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  background: linear-gradient(135deg, #f5f5f5 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__role {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: clamp(22px, 3vw, 36px);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #737373;
  min-height: 1.3em;
}

.hero__role-prefix { color: #737373; }

.hero__role-typed {
  color: #6366f1;
  min-width: 2px;
}

.hero__cursor {
  color: #6366f1;
  animation: blink 1s step-end infinite;
  margin-left: 1px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.hero__sub {
  font-size: 17px;
  line-height: 1.75;
  color: #737373;
  max-width: 520px;
}

.hero__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-pill {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #222222;
  background: rgba(255, 255, 255, 0.02);
  font-size: 12px;
  font-weight: 500;
  font-family: 'Geist Mono', monospace;
  color: #737373;
  letter-spacing: 0.02em;
  transition: border-color 0.2s, color 0.2s;
}

.tech-pill:hover {
  border-color: rgba(99, 102, 241, 0.4);
  color: #a5a6ff;
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero__btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35) !important;
  transition: box-shadow 0.3s, transform 0.2s !important;
}

.hero__btn-primary:hover {
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.55) !important;
  transform: translateY(-2px);
}

.hero__btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: 0.02em;
  border: 1px solid #333333 !important;
  color: #a0a0a0 !important;
  background: transparent;
  transition: border-color 0.2s, color 0.2s, transform 0.2s !important;
}

.hero__btn-outline:hover {
  border-color: #6366f1 !important;
  color: #f5f5f5 !important;
  transform: translateY(-2px);
}

.hero__social {
  display: flex;
  align-items: center;
  gap: 20px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #555555;
  text-decoration: none;
  transition: color 0.2s;
}

.social-link:hover { color: #6366f1; }

.social-link i { font-size: 15px; }

/* ── RIGHT ── */
.hero__right {
  display: flex;
  justify-content: center;
}

/* Profile card — glassmorphism */
.profile-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  padding: 32px;
  border-radius: 24px;
  border: 1px solid rgba(99, 102, 241, 0.15);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 0 60px rgba(99, 102, 241, 0.08), 0 24px 80px rgba(0, 0, 0, 0.5);
}

.profile-card__glow {
  position: absolute;
  inset: -1px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(99,102,241,0.15), transparent 60%, rgba(139,92,246,0.1));
  pointer-events: none;
  z-index: -1;
}

.profile-card__avatar {
  position: relative;
  width: 88px;
  height: 88px;
  margin: 0 auto;
}

.avatar-placeholder {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a1a, #111111);
  border: 2px solid rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(99, 102, 241, 0.3);
  display: block;
}

.avatar-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1.5px solid transparent;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, transparent) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
  animation: spin 8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.profile-card__identity {
  text-align: center;
}

.profile-card__name {
  font-size: 18px;
  font-weight: 700;
  color: #f5f5f5;
  letter-spacing: -0.01em;
}

.profile-card__title {
  font-size: 12px;
  color: #6366f1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: 4px;
}

.profile-card__meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #737373;
}

.meta-item i { color: #555555; font-size: 12px; }

.profile-card__divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #222222, transparent);
}

.profile-card__open {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.open-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
  animation: pulseDot 2s ease-in-out infinite;
}

/* ── SCROLL HINT ── */
.hero__scroll-hint {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 10;
}

.scroll-line {
  width: 1px;
  height: 48px;
  background: #222222;
  overflow: hidden;
  border-radius: 1px;
}

.scroll-line__inner {
  width: 100%;
  height: 50%;
  background: linear-gradient(to bottom, #6366f1, transparent);
  animation: scrollDrop 1.8s ease-in-out infinite;
}

@keyframes scrollDrop {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(200%); }
}

/* ── REVEAL ITEMS (initial state, GSAP takes over) ── */
.reveal-item { opacity: 0; }

/* Reduced-motion: skip animation, show immediately */
@media (prefers-reduced-motion: reduce) {
  .reveal-item { opacity: 1 !important; transform: none !important; }
  .hero__cursor { animation: none; opacity: 1; }
  .badge-dot { animation: none; }
  .open-dot { animation: none; }
  .scroll-line__inner { animation: none; }
  .avatar-ring { animation: none; }
}
</style>
