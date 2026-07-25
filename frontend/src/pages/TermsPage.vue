<template>
  <div class="policy-page" role="main">
    <div class="policy-page__inner">
      <RouterLink to="/" class="back-link">
        <i class="pi pi-arrow-left" style="font-size:11px;" />
        <span>Back to home</span>
      </RouterLink>

      <header class="policy-header">
        <h1 class="policy-title">Terms of Use</h1>
        <p class="policy-date">Last updated: <time datetime="2024-01-01">January 2024</time></p>
      </header>

      <div class="policy-body">
        <section class="policy-section">
          <h2>Use of This Site</h2>
          <p>This website is a personal portfolio. You may browse and share content freely. You may not reproduce, redistribute, or use any content for commercial purposes without explicit written permission.</p>
        </section>

        <section class="policy-section">
          <h2>Intellectual Property</h2>
          <p>All content on this site — including text, code samples, and design — is the intellectual property of Yash Ranjan unless otherwise noted.</p>
        </section>

        <section class="policy-section">
          <h2>Disclaimer</h2>
          <p>This site is provided "as is" without warranties of any kind. I am not liable for any damages arising from the use of this site or its content.</p>
        </section>

        <section class="policy-section">
          <h2>External Links</h2>
          <p>This site may link to external websites. I am not responsible for the content or privacy practices of those sites.</p>
        </section>

        <section class="policy-section">
          <h2>Contact</h2>
          <p>For any questions about these terms, contact me at <a :href="`mailto:${APP_EMAIL}`" class="policy-link">{{ APP_EMAIL }}</a>.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { APP_EMAIL } from '@/constants'
import { usePageMeta } from '@/composables/usePageMeta'

usePageMeta({
  title: 'Terms of Use | Yash Ranjan',
  meta: [
    { name: 'description', content: 'Terms of use for yashranjan.dev.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<style scoped>
.policy-page {
  min-height: 100vh;
  background: #0a0a0a;
  padding: 100px 0 80px;
}

.policy-page__inner {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.back-link {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 500; color: #555;
  text-decoration: none; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.04em; transition: color 0.2s; width: fit-content;
}
.back-link:hover { color: #6366f1; }

.policy-header { display: flex; flex-direction: column; gap: 8px; }

.policy-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800; letter-spacing: -0.03em; color: #f5f5f5;
}

.policy-date {
  font-size: 12px; font-family: 'Geist Mono', monospace; color: #555;
}

.policy-body { display: flex; flex-direction: column; gap: 32px; }

.policy-section { display: flex; flex-direction: column; gap: 12px; }

.policy-section h2 {
  font-size: 18px; font-weight: 700; color: #e5e5e5; letter-spacing: -0.02em;
}

.policy-section p {
  font-size: 15px; line-height: 1.8; color: #737373;
}

.policy-link {
  color: #a5b4fc; text-decoration: none; transition: color 0.2s;
}
.policy-link:hover { color: #6366f1; }
</style>
