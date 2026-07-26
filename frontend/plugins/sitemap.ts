// frontend/plugins/sitemap.ts
// Vite plugin — generates public/sitemap.xml at build time.
//
// Reads blog slugs + dates and project slugs directly from the content source
// files using regex so there are no TypeScript import/alias complications.
// Re-runs on every `vite build` and `vite dev` start — zero manual steps.

import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const BASE_URL = 'https://yashranjan.com'

// ── Static routes ─────────────────────────────────────────────────────────────
// [path, changefreq, priority]

const STATIC_ROUTES: [string, string, string][] = [
  ['/',             'weekly',  '1.0'],
  ['/about',        'monthly', '0.8'],
  ['/experience',   'monthly', '0.8'],
  ['/skills',       'monthly', '0.7'],
  ['/projects',     'weekly',  '0.9'],
  ['/blog',         'weekly',  '0.9'],
  ['/services',     'monthly', '0.8'],
  ['/contact',      'monthly', '0.7'],
  ['/testimonials', 'monthly', '0.6'],
  ['/privacy',      'yearly',  '0.3'],
  ['/terms',        'yearly',  '0.3'],
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/'/g, '&apos;')
}

function urlEntry(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string,
): string {
  return [
    '  <url>',
    `    <loc>${xmlEscape(BASE_URL + loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n')
}

// ── Content parsers ───────────────────────────────────────────────────────────

interface BlogEntry    { slug: string; date: string }
interface ProjectEntry { slug: string }

/**
 * Extracts { slug, publishedAt } pairs from the blog content file.
 *
 * Two-pass positional approach:
 *
 * Pass 1 — top-level slug lines only.
 *   Blog post slugs appear on their own line:  slug: 'postgresql-rls-...',
 *   Tag slugs appear inline:  { name: 'SaaS', slug: 'saas' }
 *   We match only lines where `slug:` is the ONLY property (no `name:` on
 *   the same line), which reliably selects post-level slugs.
 *
 * Pass 2 — publishedAt dates.
 *   Each post slug is paired with the nearest publishedAt that follows it
 *   and precedes the next post slug.
 */
function parseBlogSlugs(src: string): BlogEntry[] {
  type Pos = { value: string; idx: number }

  const slugs: Pos[] = []
  const dates: Pos[] = []

  // Split into lines so we can filter out inline tag objects
  const lines = src.split('\n')
  let offset = 0

  for (const line of lines) {
    // A top-level slug line: only whitespace + "slug:" + quoted value, no "name:" on same line
    const isTopLevel = /^\s*slug:\s*['"][^'"]+['"]\s*,?\s*$/.test(line)
    if (isTopLevel) {
      const m = line.match(/slug:\s*['"]([^'"]+)['"]/)
      if (m) slugs.push({ value: m[1].trim(), idx: offset + line.indexOf(m[0]) })
    }
    offset += line.length + 1 // +1 for the \n we split on
  }

  // Collect all publishedAt dates with their position in the full source
  const dateRe = /publishedAt:\s*['"](\d{4}-\d{2}-\d{2})['"]/g
  let dm: RegExpExecArray | null
  while ((dm = dateRe.exec(src)) !== null) {
    dates.push({ value: dm[1], idx: dm.index })
  }

  // Pair each slug with the nearest publishedAt between it and the next slug
  const entries: BlogEntry[] = []
  for (let i = 0; i < slugs.length; i++) {
    const current  = slugs[i]
    const nextSlug = slugs[i + 1]
    const date = dates.find(
      d => d.idx > current.idx && (nextSlug === undefined || d.idx < nextSlug.idx),
    )
    if (date) entries.push({ slug: current.value, date: date.value })
  }
  return entries
}

/**
 * Extracts slug values from the projects content file.
 * Deduplicates — each project has both an `id` and a `slug` with the same value.
 */
function parseProjectSlugs(src: string): ProjectEntry[] {
  const seen    = new Set<string>()
  const entries: ProjectEntry[] = []
  // Match only lines where slug: is the sole property (same top-level guard)
  for (const line of src.split('\n')) {
    const isTopLevel = /^\s*slug:\s*['"][^'"]+['"]\s*,?\s*$/.test(line)
    if (!isTopLevel) continue
    const m = line.match(/slug:\s*['"]([^'"]+)['"]/)
    if (m) {
      const slug = m[1].trim()
      if (!seen.has(slug)) { seen.add(slug); entries.push({ slug }) }
    }
  }
  return entries
}

// ── XML builder ───────────────────────────────────────────────────────────────

function buildSitemap(blogs: BlogEntry[], projects: ProjectEntry[]): string {
  const buildDate = today()
  const entries: string[] = []

  for (const [loc, freq, pri] of STATIC_ROUTES) {
    entries.push(urlEntry(loc, buildDate, freq, pri))
  }

  for (const p of projects) {
    entries.push(urlEntry(`/projects/${p.slug}`, buildDate, 'monthly', '0.7'))
  }

  for (const b of blogs) {
    entries.push(urlEntry(`/blog/${b.slug}`, b.date, 'monthly', '0.8'))
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')
}

// ── Plugin ────────────────────────────────────────────────────────────────────

export function sitemapPlugin(): Plugin {
  let outDir    = 'dist'
  let publicDir = 'public'
  let root      = process.cwd()

  function generate(targetDir: string): void {
    const blogsFile    = path.resolve(root, 'src/content/blogs/index.ts')
    const projectsFile = path.resolve(root, 'src/content/projects/index.ts')

    if (!fs.existsSync(blogsFile) || !fs.existsSync(projectsFile)) {
      console.warn('[sitemap] Content files not found — skipping')
      return
    }

    const blogs    = parseBlogSlugs(fs.readFileSync(blogsFile,    'utf-8'))
    const projects = parseProjectSlugs(fs.readFileSync(projectsFile, 'utf-8'))
    const xml      = buildSitemap(blogs, projects)

    fs.mkdirSync(targetDir, { recursive: true })
    fs.writeFileSync(path.join(targetDir, 'sitemap.xml'), xml, 'utf-8')

    console.log(
      `[sitemap] sitemap.xml → ${blogs.length} blog posts, ${projects.length} projects`,
    )
  }

  return {
    name: 'vite-plugin-sitemap',

    configResolved(config) {
      root      = config.root
      outDir    = config.build.outDir
      publicDir = typeof config.publicDir === 'string' ? config.publicDir : 'public'
    },

    // Dev: write to public/ so it's served at /sitemap.xml immediately
    buildStart() {
      if (process.env.NODE_ENV !== 'production') {
        generate(path.resolve(root, publicDir))
      }
    },

    // Production: write to dist/ after all assets are emitted
    closeBundle() {
      if (process.env.NODE_ENV === 'production') {
        generate(path.resolve(root, outDir))
      }
    },
  }
}
