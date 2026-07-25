/**
 * usePageMeta — applies a PageMeta object to the document <head>.
 * Handles: title, description, keywords, og:*, twitter:*, canonical, robots.
 * Cleans up injected nodes on unmount.
 */
import { onMounted, onUnmounted } from 'vue'
import type { PageMeta } from '@/types'

export function usePageMeta(meta: PageMeta) {
  const injected: HTMLElement[] = []

  function upsertMeta(attr: string, key: string, content: string) {
    let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
    let created = false
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, key)
      document.head.appendChild(el)
      created = true
    }
    el.content = content
    if (created) injected.push(el)
  }

  function upsertLink(rel: string, href: string) {
    let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
    let created = false
    if (!el) {
      el = document.createElement('link')
      el.rel = rel
      document.head.appendChild(el)
      created = true
    }
    el.href = href
    if (created) injected.push(el)
  }

  onMounted(() => {
    document.title = meta.title

    // Core
    upsertMeta('name', 'description', meta.description)
    if (meta.keywords) upsertMeta('name', 'keywords', meta.keywords)
    upsertMeta('name', 'robots', meta.noIndex ? 'noindex, nofollow' : 'index, follow')

    // Open Graph
    upsertMeta('property', 'og:title',       meta.title)
    upsertMeta('property', 'og:description', meta.description)
    upsertMeta('property', 'og:type',        meta.ogType  ?? 'website')
    if (meta.ogImage)  upsertMeta('property', 'og:image', meta.ogImage)
    if (meta.canonical) upsertMeta('property', 'og:url',  meta.canonical)

    // Twitter
    upsertMeta('name', 'twitter:card',        meta.twitterCard  ?? 'summary_large_image')
    upsertMeta('name', 'twitter:title',       meta.title)
    upsertMeta('name', 'twitter:description', meta.description)
    if (meta.twitterImage ?? meta.ogImage) {
      upsertMeta('name', 'twitter:image', (meta.twitterImage ?? meta.ogImage)!)
    }

    // Canonical
    if (meta.canonical) upsertLink('canonical', meta.canonical)
  })

  onUnmounted(() => {
    injected.forEach(el => el.parentNode?.removeChild(el))
  })
}
