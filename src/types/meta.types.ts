export interface PageMeta {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  canonical?: string
  noIndex?: boolean
}

export interface StructuredData {
  '@context': string
  '@type': string
  [key: string]: unknown
}
