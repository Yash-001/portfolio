export type ServiceEngagement = 'project' | 'hourly' | 'retainer' | 'consulting'

export interface ServiceDeliverable {
  text: string
}

export interface Service {
  id: string
  title: string
  tagline: string
  description: string
  icon: string
  deliverables: ServiceDeliverable[]
  engagement: ServiceEngagement
  duration?: string
  featured: boolean
  highlighted: boolean
  badge?: string
  order: number
}
