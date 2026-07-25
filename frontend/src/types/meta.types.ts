export interface PageMeta {
  title:        string
  description:  string
  keywords?:    string
  ogImage?:     string
  ogType?:      string
  ogUrl?:       string
  twitterCard?: 'summary' | 'summary_large_image'
  twitterImage?: string
  canonical?:   string
  noIndex?:     boolean
}

export interface StructuredData {
  '@context': string
  '@type': string
  [key: string]: unknown
}
