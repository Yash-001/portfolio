<template>
  <section
    id="featured"
    ref="sectionEl"
    class="fp-section"
    aria-label="Featured project"
  >
    <!-- Hero -->
    <FeaturedProjectHero />

    <!-- Sticky tab bar -->
    <div class="fp-section__tabs-wrap">
      <FeaturedProjectTabs
        v-model="activeTab"
        aria-label="Project detail tabs"
      />
    </div>

    <!-- Tab panels -->
    <div class="fp-section__panels">
      <Transition
        name="panel"
        mode="out-in"
      >
        <!-- Overview -->
        <div
          v-if="activeTab === 'overview'"
          id="panel-overview"
          key="overview"
          role="tabpanel"
          class="fp-panel"
        >
          <!-- TODO: Overview panel — timeline + tech stack by category -->
          <FeaturedProjectGallery />
        </div>

        <!-- Architecture -->
        <div
          v-else-if="activeTab === 'architecture'"
          id="panel-architecture"
          key="architecture"
          role="tabpanel"
          class="fp-panel"
        >
          <div class="fp-panel__coming-soon">
            <i class="pi pi-sitemap fp-panel__cs-icon" />
            <h3 class="fp-panel__cs-title">Architecture Diagram</h3>
            <p class="fp-panel__cs-sub">System layers, data flow, and infrastructure topology — coming soon.</p>
          </div>
        </div>

        <!-- Features -->
        <div
          v-else-if="activeTab === 'features'"
          id="panel-features"
          key="features"
          role="tabpanel"
          class="fp-panel"
        >
          <div class="fp-panel__coming-soon">
            <i class="pi pi-star fp-panel__cs-icon" />
            <h3 class="fp-panel__cs-title">Feature Breakdown</h3>
            <p class="fp-panel__cs-sub">Detailed feature cards covering every module of the EAM system — coming soon.</p>
          </div>
        </div>

        <!-- Challenges -->
        <div
          v-else-if="activeTab === 'challenges'"
          id="panel-challenges"
          key="challenges"
          role="tabpanel"
          class="fp-panel"
        >
          <div class="fp-panel__coming-soon">
            <i class="pi pi-exclamation-triangle fp-panel__cs-icon" />
            <h3 class="fp-panel__cs-title">Engineering Challenges</h3>
            <p class="fp-panel__cs-sub">Problem / solution / impact cards for the hardest technical decisions — coming soon.</p>
          </div>
        </div>

        <!-- API Design -->
        <div
          v-else-if="activeTab === 'api'"
          id="panel-api"
          key="api"
          role="tabpanel"
          class="fp-panel"
        >
          <div class="fp-panel__coming-soon">
            <i class="pi pi-code fp-panel__cs-icon" />
            <h3 class="fp-panel__cs-title">API Design</h3>
            <p class="fp-panel__cs-sub">Endpoint table, authentication strategy, and rate-limiting design — coming soon.</p>
          </div>
        </div>

        <!-- Database -->
        <div
          v-else-if="activeTab === 'database'"
          id="panel-database"
          key="database"
          role="tabpanel"
          class="fp-panel"
        >
          <div class="fp-panel__coming-soon">
            <i class="pi pi-database fp-panel__cs-icon" />
            <h3 class="fp-panel__cs-title">Database Architecture</h3>
            <p class="fp-panel__cs-sub">Schema design, Row-Level Security, and index strategy — coming soon.</p>
          </div>
        </div>

        <!-- Security -->
        <div
          v-else-if="activeTab === 'security'"
          id="panel-security"
          key="security"
          role="tabpanel"
          class="fp-panel"
        >
          <div class="fp-panel__coming-soon">
            <i class="pi pi-shield fp-panel__cs-icon" />
            <h3 class="fp-panel__cs-title">Security Model</h3>
            <p class="fp-panel__cs-sub">Auth, RBAC, audit logging, and threat mitigation — coming soon.</p>
          </div>
        </div>

        <!-- Performance -->
        <div
          v-else-if="activeTab === 'performance'"
          id="panel-performance"
          key="performance"
          role="tabpanel"
          class="fp-panel"
        >
          <div class="fp-panel__coming-soon">
            <i class="pi pi-gauge fp-panel__cs-icon" />
            <h3 class="fp-panel__cs-title">Performance & Scalability</h3>
            <p class="fp-panel__cs-sub">Latency benchmarks, caching strategy, and horizontal scaling design — coming soon.</p>
          </div>
        </div>

        <!-- Deployment -->
        <div
          v-else-if="activeTab === 'deployment'"
          id="panel-deployment"
          key="deployment"
          role="tabpanel"
          class="fp-panel"
        >
          <div class="fp-panel__coming-soon">
            <i class="pi pi-cloud-upload fp-panel__cs-icon" />
            <h3 class="fp-panel__cs-title">Deployment Pipeline</h3>
            <p class="fp-panel__cs-sub">CI/CD pipeline steps, infrastructure-as-code, and zero-downtime deploy strategy — coming soon.</p>
          </div>
        </div>

        <!-- Roadmap -->
        <div
          v-else-if="activeTab === 'roadmap'"
          id="panel-roadmap"
          key="roadmap"
          role="tabpanel"
          class="fp-panel"
        >
          <div class="fp-panel__coming-soon">
            <i class="pi pi-map fp-panel__cs-icon" />
            <h3 class="fp-panel__cs-title">Product Roadmap</h3>
            <p class="fp-panel__cs-sub">Build history timeline and planned feature milestones — coming soon.</p>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from '@/plugins/gsap'
import type { EamTabId } from '@/constants/featured-project.constants'
import FeaturedProjectHero    from './FeaturedProjectHero.vue'
import FeaturedProjectTabs    from './FeaturedProjectTabs.vue'
import FeaturedProjectGallery from './FeaturedProjectGallery.vue'

const sectionEl = ref<HTMLElement | null>(null)
const activeTab = ref<EamTabId>('overview')

let gsapCtx: ReturnType<typeof gsap.context> | null = null

onMounted(() => {
  gsapCtx = gsap.context(() => {
    gsap.fromTo('.fp-section__tabs-wrap',
      { opacity: 0, y: 20 },
      { scrollTrigger: { trigger: '.fp-section__tabs-wrap', start: 'top 90%', once: true },
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

.fp-panel {
  width: 100%;
}

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

.fp-panel__cs-icon {
  font-size: 36px;
  color: rgba(99,102,241,0.4);
}

.fp-panel__cs-title {
  font-size: 18px;
  font-weight: 700;
  color: #a0a0a0;
  letter-spacing: -0.02em;
}

.fp-panel__cs-sub {
  font-size: 14px;
  line-height: 1.7;
  color: #555;
  max-width: 44ch;
}
</style>
