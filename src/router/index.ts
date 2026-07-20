import { ref } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw, type RouteMeta } from 'vue-router'
import { PAGE_META, DEFAULT_META, APP_URL } from '@/constants'
import { i18n } from '@/i18n'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
    ogImage?: string
    canonical?: string
    noIndex?: boolean
    transition?: string
    loading?: boolean
  }
}

export const isNavigating = ref(false)

function meta(key: keyof typeof PAGE_META, overrides: Partial<RouteMeta> = {}): RouteMeta {
  const m = PAGE_META[key]
  return {
    title:       m.title,
    description: m.description,
    ogImage:     m.ogImage     ?? DEFAULT_META.ogImage,
    transition:  'page',
    ...overrides,
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      { path: '',            name: 'home',          component: () => import('@/pages/HomePage.vue'),                    meta: meta('home') },
      { path: 'about',       name: 'about',         component: () => import('@/pages/AboutPage.vue'),                   meta: meta('about') },
      { path: 'experience',  name: 'experience',    component: () => import('@/pages/ExperiencePage.vue'),              meta: meta('experience') },
      { path: 'skills',      name: 'skills',        component: () => import('@/pages/SkillsPage.vue'),                  meta: meta('skills') },
      { path: 'services',    name: 'services',      component: () => import('@/pages/ServicesPage.vue'),                meta: meta('services') },
      { path: 'testimonials',name: 'testimonials',  component: () => import('@/pages/TestimonialsPage.vue'),            meta: meta('testimonials') },
      { path: 'contact',     name: 'contact',       component: () => import('@/pages/ContactPage.vue'),                 meta: meta('contact') },
      { path: 'privacy',     name: 'privacy',       component: () => import('@/pages/PrivacyPage.vue'),                 meta: { title: 'Privacy Policy | Yash Ranjan', description: 'Privacy policy.', noIndex: true, transition: 'page' } },
      { path: 'terms',       name: 'terms',         component: () => import('@/pages/TermsPage.vue'),                   meta: { title: 'Terms of Use | Yash Ranjan',   description: 'Terms of use.',   noIndex: true, transition: 'page' } },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/pages/ProjectsPage.vue'),
        meta: meta('projects'),
        children: [
          {
            path: ':slug',
            name: 'project-detail',
            component: () => import('@/pages/projects/ProjectDetailPage.vue'),
            meta: { title: 'Project | Yash Ranjan', description: DEFAULT_META.description, ogImage: DEFAULT_META.ogImage, transition: 'page' },
          },
        ],
      },
      {
        path: 'blog',
        name: 'blog',
        component: () => import('@/pages/BlogPage.vue'),
        meta: meta('blog'),
        children: [
          {
            path: ':slug',
            name: 'blog-post',
            component: () => import('@/pages/BlogPostPage.vue'),
            meta: { title: 'Blog | Yash Ranjan', description: DEFAULT_META.description, ogImage: DEFAULT_META.ogImage, transition: 'page' },
          },
        ],
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: '404 | Yash Ranjan', description: 'Page not found.', noIndex: true, transition: 'page' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      // Defer to next tick so async components have time to mount
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ el: to.hash, behavior: 'smooth', top: 80 })
        }, 100)
      })
    }
    return { top: 0, behavior: 'instant' }
  },
})

router.beforeEach(() => {
  isNavigating.value = true
  // Ensure body scroll is never left locked between page navigations
  document.body.style.overflow = ''
})

router.afterEach((to) => {
  isNavigating.value = false

  const g = i18n.global as any
  const name = String(to.name ?? '')
  const metaKey = `meta.${name}.title`
  const descKey = `meta.${name}.description`

  const title       = g.te(metaKey) ? g.t(metaKey) : (to.meta.title       ?? DEFAULT_META.title ?? '')
  const description = g.te(descKey) ? g.t(descKey) : (to.meta.description ?? DEFAULT_META.description ?? '')
  const canonical   = to.meta.canonical ?? `${APP_URL}${to.path}`
  document.title = title as string
  setMetaTag('name',     'description',   description as string)
  setLinkTag('canonical', canonical)

  // Open Graph
  setMetaTag('property', 'og:title',       to.meta.title       ?? DEFAULT_META.title)
  setMetaTag('property', 'og:description', to.meta.description ?? DEFAULT_META.description!)
  setMetaTag('property', 'og:url',         canonical)
  setMetaTag('property', 'og:image',       to.meta.ogImage     ?? DEFAULT_META.ogImage!)

  // Robots
  setMetaTag('name', 'robots', to.meta.noIndex ? 'noindex, nofollow' : 'index, follow')
})

function setMetaTag(attr: string, key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}
