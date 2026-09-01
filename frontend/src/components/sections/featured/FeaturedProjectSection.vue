<template>
  <section
    id="featured"
    ref="sectionEl"
    class="fp-section"
    aria-label="Featured projects"
  >
    <!-- ── Project switcher ──────────────────────────────────────── -->
    <div class="fp-switcher-wrap">
      <div class="fp-switcher">
        <span class="fp-switcher__label">Featured Projects</span>
        <div class="fp-switcher__pills">
          <button
            v-for="fp in FEATURED_PROJECTS"
            :key="fp.key"
            class="fp-switcher__pill"
            :class="{ 'fp-switcher__pill--active': activeProject === fp.key }"
            :style="activeProject === fp.key ? { '--pc': fp.color } : {}"
            @click="switchProject(fp.key)"
          >
            <i :class="fp.icon" />
            <span>{{ fp.label }}</span>
            <span class="fp-switcher__sublabel">{{ fp.sublabel }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Hero (re-renders on project switch) ───────────────────── -->
    <Transition name="fp-switch" mode="out-in">
      <FeaturedProjectHero
        :key="activeProject"
        :featured="activeFeatured"
      />
    </Transition>

    <!-- ── Sticky detail tab bar ─────────────────────────────────── -->
    <div class="fp-section__tabs-wrap">
      <FeaturedProjectTabs
        v-model="activeTab"
        :tabs="activeFeatured.tabs"
        aria-label="Project detail tabs"
      />
    </div>

    <!-- ── Tab panels ────────────────────────────────────────────── -->
    <div class="fp-section__panels">
      <Transition name="panel" mode="out-in">
        <div
          :key="`${activeProject}-${activeTab}`"
          class="fp-panel"
          role="tabpanel"
        >
          <!-- Overview: gallery -->
          <FeaturedProjectGallery
            v-if="activeTab === 'overview'"
            :screenshots="activeFeatured.screenshots"
          />

          <!-- All other tabs: coming-soon placeholder -->
          <div
            v-else
            class="fp-panel__coming-soon"
          >
            <i
              :class="activeTabMeta?.icon"
              class="fp-panel__cs-icon"
            />
            <h3 class="fp-panel__cs-title">
              {{ activeTabMeta?.label }}
            </h3>
            <p class="fp-panel__cs-sub">
              Detailed breakdown coming soon.
            </p>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'
import { FEATURED_PROJECTS } from '@/constants/featured-project.constants'
import type { FeaturedProjectKey } from '@/constants/featured-project.constants'
import FeaturedProjectHero    from './FeaturedProjectHero.vue'
import FeaturedProjectTabs    from './FeaturedProjectTabs.vue'
import FeaturedProjectGallery from './FeaturedProjectGallery.vue'

const sectionEl     = ref<HTMLElement | null>(null)
const activeProject = ref<FeaturedProjectKey>('careerforge')
const activeTab     = ref('overview')

const activeFeatured = computed(() =>
  FEATURED_PROJECTS.find(fp => fp.key === activeProject.value)!
)

const activeTabMeta = computed(() =>
  activeFeatured.value.tabs.find((t: { id: string }) => t.id === activeTab.value)
)

function switchProject(key: FeaturedProjectKey) {
  activeProject.value = key
  activeTab.value     = 'overview'
}

// Reset tab to overview when project changes
watch(activeProject, () => { activeTab.value = 'overview' })

let gsapCtx: ReturnType<typeof gsap.context> | null = null

onMounted(() => {
  gsapCtx = gsap.context(() => {
    gsap.fromTo('.fp-switcher-wrap',
      { opacity: 0, y: 20 },
      { scrollTrigger: { trigger: '.fp-switcher-wrap', start: 'top 90%', once: true },
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: 'all' },
    )
  }, sectionEl.value!)
})

onUnmounted(() => gsapCtx?.revert())
</script>

<style scoped>
.fp-section {
  background: #0a0a0a;
  overflow: hidden;
}

/* ── Project switcher ──────────────────────────────────────────── */
.fp-switcher-wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 60px 24px 0;
  display: flex;
  justify-content: center;
}

.fp-switcher {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.fp-switcher__label {
  font-size: 11px;
  font-weight: 600;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #555;
}

.fp-switcher__pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.fp-switcher__pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: #555;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.fp-switcher__pill i { font-size: 13px; }

.fp-switcher__pill:hover:not(.fp-switcher__pill--active) {
  border-color: rgba(255,255,255,0.15);
  color: #a0a0a0;
  transform: translateY(-1px);
}

.fp-switcher__pill--active {
  border-color: color-mix(in srgb, var(--pc, #6366f1) 40%, transparent);
  background: color-mix(in srgb, var(--pc, #6366f1) 10%, transparent);
  color: color-mix(in srgb, var(--pc, #6366f1) 90%, #fff);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--pc, #6366f1) 20%, transparent);
}

.fp-switcher__sublabel {
  font-size: 10px;
  font-family: 'Geist Mono', monospace;
  opacity: 0.6;
  letter-spacing: 0.04em;
}

/* ── Sticky tab bar ────────────────────────────────────────────── */
.fp-section__tabs-wrap {
  position: sticky;
  top: 64px;
  z-index: 40;
  padding: 16px 0;
  background: rgba(10,10,10,0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.fp-section__panels {
  max-width: 1280px;
  margin: 0 auto;
  padding: 56px 24px 100px;
  min-height: 400px;
}

.fp-panel { width: 100%; }

/* Project switch transition */
.fp-switch-enter-active { transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1); }
.fp-switch-leave-active { transition: opacity 0.2s ease; }
.fp-switch-enter-from   { opacity: 0; transform: translateY(20px); }
.fp-switch-leave-to     { opacity: 0; }

/* Panel transition */
.panel-enter-active { transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1); }
.panel-leave-active { transition: opacity 0.15s ease; }
.panel-enter-from   { opacity: 0; transform: translateY(16px); }
.panel-leave-to     { opacity: 0; }

/* Coming-soon placeholder */
.fp-panel__coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 24px;
  text-align: center;
  border-radius: 20px;
  border: 1px dashed rgba(99,102,241,0.2);
  background: rgba(99,102,241,0.03);
  min-height: 280px;
}

.fp-panel__cs-icon  { font-size: 36px; color: rgba(99,102,241,0.4); }
.fp-panel__cs-title { font-size: 18px; font-weight: 700; color: #a0a0a0; letter-spacing: -0.02em; }
.fp-panel__cs-sub   { font-size: 14px; line-height: 1.7; color: #555; max-width: 44ch; }
</style>
