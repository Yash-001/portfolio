// src/types/content/certification.content.types.ts

export interface Certification {
  id: string
  name: string
  issuer: string
  issuedDate: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  logo?: string
}
