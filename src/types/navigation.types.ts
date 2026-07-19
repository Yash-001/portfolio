// navigation.types.ts
export interface NavLink {
  label: string
  to: string
  hash?: string
  external?: boolean
}

export interface SocialLink {
  platform: 'github' | 'linkedin' | 'email' | 'twitter'
  url: string
  label: string
  icon: string
}
