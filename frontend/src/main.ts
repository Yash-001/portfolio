import { createApp } from 'vue'
import App from './App.vue'
import { NAME, TITLE, SITE_URL, GITHUB, LINKEDIN, EMAIL, SEO } from '@/content/settings/portfolio.config'

import { router }          from '@/router'
import { pinia }           from '@/plugins/pinia'
import { primevue }        from '@/plugins/primevue'
import { gsapPlugin }      from '@/plugins/gsap'
import { i18nPlugin }      from '@/plugins/i18n'
import { analyticsPlugin } from '@/plugins/analytics'

import '@/styles/main.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(primevue)
app.use(gsapPlugin)
app.use(i18nPlugin)
app.use(analyticsPlugin)

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: NAME,
  jobTitle: TITLE,
  email: EMAIL,
  url: SITE_URL || 'https://yashranjan.com',
  image: `${SITE_URL || 'https://yashranjan.com'}${SEO.ogImage}`,
  sameAs: [GITHUB, LINKEDIN],
  knowsAbout: [
    'Java', 'Spring Boot', 'Vue.js', 'Angular', 'TypeScript',
    'Python', 'AWS', 'GCP', 'Docker', 'Kubernetes', 'AI/ML',
  ],
}
const ldScript = document.createElement('script')
ldScript.type = 'application/ld+json'
ldScript.textContent = JSON.stringify(jsonLd)
document.head.appendChild(ldScript)

app.mount('#app')
