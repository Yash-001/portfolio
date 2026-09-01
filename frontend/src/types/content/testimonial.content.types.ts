// src/types/content/testimonial.content.types.ts
import type { Testimonial } from '@/types/testimonial.types'

export interface TestimonialFull extends Testimonial {
  rating: 1 | 2 | 3 | 4 | 5
  companyLogo?: string
  companyUrl?: string
  projectRef?: string
  engagement?: string
  location?: string
  date?: string
}
