/**
 * usePageMeta — sets <title>, <meta>, <link>, and <script type="application/ld+json">
 * tags on the document head. Cleans up injected nodes on unmount.
 * Zero dependencies — works with any Vue 3 project.
 */
import { onMounted, onUnmounted } from 'vue'

interface MetaTag {
  name?: string
  property?: string
  content: string
}

interface HeadOptions {
  title?: string
  meta?: MetaTag[]
  canonical?: string
  jsonLd?: object
}

export function usePageMeta(options: HeadOptions) {
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
    const prev = el.content
    el.content = content
    if (created) injected.push(el)
    return { el, prev }
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
    if (options.title) document.title = options.title

    options.meta?.forEach((m) => {
      if (m.name)     upsertMeta('name',     m.name,     m.content)
      if (m.property) upsertMeta('property', m.property, m.content)
    })

    if (options.canonical) upsertLink('canonical', options.canonical)

    if (options.jsonLd) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(options.jsonLd)
      document.head.appendChild(script)
      injected.push(script)
    }
  })

  onUnmounted(() => {
    injected.forEach((el) => el.parentNode?.removeChild(el))
  })
}
