<template>
  <footer
    ref="footerEl"
    class="ft"
    aria-label="Site footer"
  >
    <!-- Background -->
    <div
      class="ft__bg"
      aria-hidden="true"
    >
      <div class="ft-orb ft-orb--1" />
      <div class="ft-orb ft-orb--2" />
      <div class="ft-grid-lines" />
    </div>

    <!-- Top divider glow -->
    <div
      class="ft__divider"
      aria-hidden="true"
    />

    <!-- ── Main grid ─────────────────────────────────────────── -->
    <div class="ft__inner">
      <!-- Col 1 — Brand -->
      <div
        ref="brandEl"
        class="ft-brand"
      >
        <a
          href="/"
          class="ft-brand__logo"
          aria-label="Back to top"
          @click.prevent="scrollTop"
        >
          <span class="ft-brand__monogram">YR</span>
          <span class="ft-brand__name">{{ APP_NAME }}</span>
        </a>
        <p class="ft-brand__tagline">
          {{ APP_TITLE }}
        </p>
        <p class="ft-brand__bio">
          Building production-grade systems for startups and enterprises.
          Available for remote engagements worldwide.
        </p>

        <!-- Availability badge -->
        <div class="ft-brand__avail">
          <span
            class="ft-avail-dot"
            aria-hidden="true"
          />
          <span>{{ APP_AVAILABILITY_TEXT }}</span>
          <span
            class="ft-avail-sep"
            aria-hidden="true"
          >·</span>
          <span class="ft-avail-tz">{{ APP_LOCATION }}</span>
        </div>

        <!-- Social row -->
        <div
          class="ft-brand__socials"
          role="list"
          aria-label="Social links"
        >
          <a
            v-for="s in SOCIALS"
            :key="s.label"
            :href="s.href"
            :aria-label="s.label"
            :title="s.label"
            class="ft-social"
            role="listitem"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i :class="s.icon" />
          </a>
          <a
            :href="APP_RESUME_URL"
            aria-label="Download resume"
            title="Download resume"
            class="ft-social ft-social--resume"
            download
          >
            <i class="pi pi-file-pdf" />
          </a>
        </div>
      </div>

      <!-- Col 2 — Navigation -->
      <nav
        ref="navEl"
        class="ft-nav"
        aria-label="Footer navigation"
      >
        <h3 class="ft-nav__heading">
          Navigation
        </h3>
        <ul class="ft-nav__list">
          <li
            v-for="link in NAV_LINKS"
            :key="link.label"
          >
            <a
              :href="link.href"
              class="ft-nav__link"
            >
              <span
                class="ft-nav__link-arrow"
                aria-hidden="true"
              >→</span>
              {{ link.label }}
            </a>
          </li>
        </ul>
      </nav>

      <!-- Col 3 — Services -->
      <nav
        ref="servicesEl"
        class="ft-nav"
        aria-label="Services"
      >
        <h3 class="ft-nav__heading">
          Services
        </h3>
        <ul class="ft-nav__list">
          <li
            v-for="s in SERVICE_LINKS"
            :key="s"
          >
            <a
              href="/#services"
              class="ft-nav__link"
            >
              <span
                class="ft-nav__link-arrow"
                aria-hidden="true"
              >→</span>
              {{ s }}
            </a>
          </li>
        </ul>
      </nav>

      <!-- Col 4 — Resources + Newsletter -->
      <div
        ref="resourcesEl"
        class="ft-resources"
      >
        <nav aria-label="Resources">
          <h3 class="ft-nav__heading">
            Resources
          </h3>
          <ul class="ft-nav__list">
            <li
              v-for="r in RESOURCE_LINKS"
              :key="r.label"
            >
              <a
                :href="r.href"
                class="ft-nav__link"
                :target="r.external ? '_blank' : undefined"
                :rel="r.external ? 'noopener noreferrer' : undefined"
              >
                <span
                  class="ft-nav__link-arrow"
                  aria-hidden="true"
                >→</span>
                {{ r.label }}
                <span
                  v-if="r.external"
                  class="ft-nav__ext"
                  aria-hidden="true"
                >↗</span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- Newsletter -->
        <div
          class="ft-newsletter"
          aria-label="Newsletter signup"
        >
          <h3
            class="ft-nav__heading"
            style="margin-top: 32px;"
          >
            Stay in the loop
          </h3>
          <p class="ft-newsletter__sub">
            Occasional posts on architecture, engineering, and shipping fast.
          </p>
          <form
            class="ft-newsletter__form"
            novalidate
            @submit.prevent="handleSubscribe"
          >
            <div class="ft-newsletter__field">
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="ft-newsletter__input"
                :class="{ 'ft-newsletter__input--error': emailError }"
                aria-label="Email address"
                autocomplete="email"
              />
              <button
                type="submit"
                class="ft-newsletter__btn"
                :disabled="subscribed"
                aria-label="Subscribe"
              >
                <i
                  v-if="!subscribed"
                  class="pi pi-send"
                />
                <i
                  v-else
                  class="pi pi-check"
                />
              </button>
            </div>
            <p
              v-if="emailError"
              class="ft-newsletter__error"
              role="alert"
            >
              {{ emailError }}
            </p>
            <p
              v-if="subscribed"
              class="ft-newsletter__success"
              role="status"
            >
              You're on the list. 🎉
            </p>
          </form>
        </div>
      </div>
    </div>

    <!-- ── Bottom bar ────────────────────────────────────────── -->
    <div
      ref="bottomEl"
      class="ft__bottom"
    >
      <div class="ft__bottom-inner">
        <p class="ft-copy">
          © {{ year }} {{ APP_NAME }}. Crafted with
          <span
            class="ft-copy__heart"
            aria-label="love"
          >♥</span>
          in India.
        </p>

        <div class="ft-bottom-links">
          <a
            href="/privacy"
            class="ft-bottom-link"
          >Privacy</a>
          <span
            class="ft-bottom-sep"
            aria-hidden="true"
          >·</span>
          <a
            href="/terms"
            class="ft-bottom-link"
          >Terms</a>
          <span
            class="ft-bottom-sep"
            aria-hidden="true"
          >·</span>
          <a
            :href="SOCIAL_LINKS.github"
            class="ft-bottom-link"
            target="_blank"
            rel="noopener noreferrer"
          >GitHub</a>
          <span
            class="ft-bottom-sep"
            aria-hidden="true"
          >·</span>
          <a
            :href="SOCIAL_LINKS.linkedin"
            class="ft-bottom-link"
            target="_blank"
            rel="noopener noreferrer"
          >LinkedIn</a>
        </div>

        <!-- Back to top -->
        <button
          class="ft-top-btn"
          type="button"
          :class="{ 'ft-top-btn--visible': showTop }"
          aria-label="Back to top"
          @click="scrollTop"
        >
          <i class="pi pi-arrow-up" />
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'
import {
  APP_NAME, APP_TITLE, APP_LOCATION, APP_AVAILABILITY_TEXT, SOCIAL_LINKS, APP_RESUME_URL, APP_CALENDLY_URL,
} from '@/constants/app.constants'

// ── Constants ──────────────────────────────────────────────────
const SOCIALS = [
  { label: 'GitHub',   href: SOCIAL_LINKS.github,   icon: 'pi pi-github'   },
  { label: 'LinkedIn', href: SOCIAL_LINKS.linkedin,  icon: 'pi pi-linkedin' },
  { label: 'Email',    href: SOCIAL_LINKS.email,     icon: 'pi pi-envelope' },
]

const NAV_LINKS = [
  { label: 'About',      href: '/#about'      },
  { label: 'Skills',     href: '/#skills'     },
  { label: 'Experience', href: '/#experience' },
  { label: 'Projects',   href: '/#projects'   },
  { label: 'Services',   href: '/#services'   },
  { label: 'Blog',       href: '/#blog'       },
  { label: 'Contact',    href: '/#contact'    },
]

const SERVICE_LINKS = [
  'Backend Engineering',
  'API Design & Integration',
  'Cloud Infrastructure',
  'Database Architecture',
  'Performance Optimization',
  'Technical Consulting',
]

const RESOURCE_LINKS = [
  { label: 'Blog',           href: '/#blog',          external: false },
  { label: 'Resume',         href: APP_RESUME_URL,    external: true  },
  { label: 'GitHub Profile', href: SOCIAL_LINKS.github,   external: true  },
  { label: 'LinkedIn',       href: SOCIAL_LINKS.linkedin,  external: true  },
  { label: 'Book a Call',    href: APP_CALENDLY_URL,  external: true  },
  { label: 'Contact',        href: '/#contact',       external: false },
]

// ── State ──────────────────────────────────────────────────────
const year      = computed(() => new Date().getFullYear())
const email     = ref('')
const emailError = ref('')
const subscribed = ref(false)
const showTop   = ref(false)

// ── Refs ───────────────────────────────────────────────────────
const footerEl    = ref<HTMLElement | null>(null)
const brandEl     = ref<HTMLElement | null>(null)
const navEl       = ref<HTMLElement | null>(null)
const servicesEl  = ref<HTMLElement | null>(null)
const resourcesEl = ref<HTMLElement | null>(null)
const bottomEl    = ref<HTMLElement | null>(null)

// ── Newsletter ─────────────────────────────────────────────────
function handleSubscribe() {
  emailError.value = ''
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email address.'
    return
  }
  subscribed.value = true
}

// ── Back to top ────────────────────────────────────────────────
function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onScroll() {
  showTop.value = window.scrollY > 600
}

// ── GSAP ───────────────────────────────────────────────────────
let gsapCtx: ReturnType<typeof gsap.context> | null = null

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })

  gsapCtx = gsap.context(() => {
    const ease = 'power3.out'
    const cols = [brandEl.value, navEl.value, servicesEl.value, resourcesEl.value]

    gsap.from(cols, {
      scrollTrigger: { trigger: footerEl.value, start: 'top 88%', once: true },
      opacity: 0, y: 40, duration: 0.8, ease, stagger: 0.1,
    })
    gsap.from(bottomEl.value, {
      scrollTrigger: { trigger: bottomEl.value, start: 'top 98%', once: true },
      opacity: 0, y: 16, duration: 0.5, ease,
    })
  }, footerEl.value!)
})

onUnmounted(() => {
  gsapCtx?.revert()
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
/* ── Shell ─────────────────────────────────────────────────────── */
.ft {
  position: relative;
  background: #080808;
  overflow: hidden;
}

/* ── Background ────────────────────────────────────────────────── */
.ft__bg { position: absolute; inset: 0; pointer-events: none; }

.ft-orb {
  position: absolute; border-radius: 50%;
  filter: blur(120px); pointer-events: none;
}
.ft-orb--1 {
  width: 500px; height: 500px; top: -100px; left: -80px;
  background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
  animation: ftOrb 16s ease-in-out infinite;
}
.ft-orb--2 {
  width: 400px; height: 400px; bottom: 0; right: -60px;
  background: radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%);
  animation: ftOrb 20s ease-in-out infinite reverse;
}
@keyframes ftOrb {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(30px, -40px); }
}

.ft-grid-lines {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.4) 70%, transparent 100%);
}

/* ── Top divider ───────────────────────────────────────────────── */
.ft__divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3) 30%, rgba(139,92,246,0.3) 70%, transparent);
}

/* ── Main grid ─────────────────────────────────────────────────── */
.ft__inner {
  max-width: 1280px; margin: 0 auto;
  padding: 72px 24px 56px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  position: relative;
}
@media (min-width: 640px)  { .ft__inner { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .ft__inner { grid-template-columns: 2fr 1fr 1fr 1.6fr; gap: 40px; } }

/* ── Brand col ─────────────────────────────────────────────────── */
.ft-brand { display: flex; flex-direction: column; gap: 16px; }

.ft-brand__logo {
  display: inline-flex; align-items: center; gap: 10px;
  text-decoration: none; width: fit-content;
  border-radius: 8px;
}
.ft-brand__logo:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 4px;
}
.ft-brand__monogram {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: #fff; letter-spacing: 0.02em;
}
.ft-brand__name {
  font-size: 16px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.02em;
}

.ft-brand__tagline {
  font-size: 12px; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: #6366f1;
  font-family: 'Geist Mono', monospace;
}

.ft-brand__bio {
  font-size: 14px; line-height: 1.75; color: #737373; max-width: 34ch;
}

/* Availability */
.ft-brand__avail {
  display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 7px 14px; border-radius: 100px; width: fit-content;
  border: 1px solid rgba(16,185,129,0.2); background: rgba(16,185,129,0.05);
  font-size: 12px; font-weight: 600; color: #10b981;
}
.ft-avail-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #10b981; flex-shrink: 0;
  box-shadow: 0 0 8px rgba(16,185,129,0.6);
  animation: availPulse 2s ease-in-out infinite;
}
@keyframes availPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(16,185,129,0.6); }
  50%       { box-shadow: 0 0 14px rgba(16,185,129,0.9); }
}
.ft-avail-sep { color: rgba(16,185,129,0.3); }
.ft-avail-tz  { font-family: 'Geist Mono', monospace; font-size: 11px; color: #4ade80; opacity: 0.7; }

/* Socials */
.ft-brand__socials { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.ft-social {
  width: 36px; height: 36px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.03);
  display: flex; align-items: center; justify-content: center;
  color: #737373; font-size: 14px; text-decoration: none;
  transition: all 0.22s;
}
.ft-social:hover {
  border-color: rgba(99,102,241,0.4);
  background: rgba(99,102,241,0.1);
  color: #a5b4fc;
  transform: translateY(-2px);
}
.ft-social:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
.ft-social--resume:hover {
  border-color: rgba(239,68,68,0.4);
  background: rgba(239,68,68,0.08);
  color: #fca5a5;
}

/* ── Nav cols ──────────────────────────────────────────────────── */
.ft-nav__heading {
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: #f5f5f5;
  font-family: 'Geist Mono', monospace;
  margin-bottom: 20px;
}

.ft-nav__list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 10px;
}

.ft-nav__link {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 14px; color: #737373; text-decoration: none;
  transition: color 0.2s;
  border-radius: 4px;
}
.ft-nav__link:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 3px;
}
.ft-nav__link-arrow {
  font-size: 11px; color: #6366f1; opacity: 0;
  display: inline-block;
  translate: -4px 0;
  transition: opacity 0.2s, translate 0.2s;
}
.ft-nav__link:hover { color: #e5e5e5; }
.ft-nav__link:hover .ft-nav__link-arrow { opacity: 1; translate: 0 0; }

.ft-nav__ext {
  font-size: 10px; color: #555; margin-left: 2px;
}

/* ── Newsletter ────────────────────────────────────────────────── */
.ft-newsletter__sub {
  font-size: 13px; line-height: 1.65; color: #555; margin-bottom: 14px; max-width: 28ch;
}

.ft-newsletter__form { display: flex; flex-direction: column; gap: 8px; }

.ft-newsletter__field {
  display: flex; gap: 0;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px; overflow: hidden;
  background: rgba(255,255,255,0.03);
  transition: border-color 0.2s;
}
.ft-newsletter__field:focus-within {
  border-color: rgba(99,102,241,0.4);
}

.ft-newsletter__input {
  flex: 1; background: transparent; border: none; outline: none;
  padding: 10px 14px; font-size: 13px; color: #e5e5e5;
  font-family: inherit;
}
.ft-newsletter__input::placeholder { color: #555; }
.ft-newsletter__input--error { color: #fca5a5; }

.ft-newsletter__btn {
  padding: 10px 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none; cursor: pointer; color: #fff; font-size: 13px;
  transition: opacity 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.ft-newsletter__btn:hover:not(:disabled) { opacity: 0.85; }
.ft-newsletter__btn:disabled { opacity: 0.6; cursor: default; }
.ft-newsletter__btn:focus-visible {
  outline: 2px solid #a5b4fc;
  outline-offset: -2px;
}

.ft-newsletter__error  { font-size: 12px; color: #f87171; }
.ft-newsletter__success { font-size: 12px; color: #4ade80; }

/* ── Bottom bar ────────────────────────────────────────────────── */
.ft__bottom {
  border-top: 1px solid rgba(255,255,255,0.05);
  position: relative;
}
.ft__bottom-inner {
  max-width: 1280px; margin: 0 auto;
  padding: 20px 24px;
  display: flex; align-items: center; flex-wrap: wrap; gap: 16px;
  justify-content: space-between;
}

.ft-copy {
  font-size: 13px; color: #555; font-family: 'Geist Mono', monospace;
}
.ft-copy__heart { color: #f87171; }

.ft-bottom-links {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.ft-bottom-link {
  font-size: 12px; color: #555; text-decoration: none;
  font-family: 'Geist Mono', monospace;
  transition: color 0.2s;
}
.ft-bottom-link:hover { color: #a5b4fc; }
.ft-bottom-link:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
  border-radius: 2px;
}
.ft-bottom-sep { color: #333; font-size: 11px; }

/* ── Back to top ───────────────────────────────────────────────── */
.ft-top-btn {
  width: 36px; height: 36px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.03);
  color: #555; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  translate: 0 8px;
  transition: opacity 0.3s, translate 0.3s, border-color 0.2s, background 0.2s, color 0.2s;
}
.ft-top-btn--visible {
  opacity: 1; pointer-events: auto; translate: 0 0;
}
.ft-top-btn:hover {
  border-color: rgba(99,102,241,0.4);
  background: rgba(99,102,241,0.1);
  color: #a5b4fc;
  translate: 0 -2px;
}
.ft-top-btn:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
</style>
