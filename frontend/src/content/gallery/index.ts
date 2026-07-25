// ─────────────────────────────────────────────────────────────────────────────
// src/content/gallery/index.ts
// Photo gallery items (speaking, events, workspace, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: string
  src: string
  alt: string
  caption?: string
  category?: string
}

export const GALLERY_ITEMS: GalleryItem[] = [
  // Example — replace with real data:
  // {
  //   id: 'conf-2024',
  //   src: '/images/gallery/conf-2024.jpg',
  //   alt: 'Speaking at DevConf 2024',
  //   caption: 'Keynote on multi-tenant architecture — DevConf 2024',
  //   category: 'speaking',
  // },
]
