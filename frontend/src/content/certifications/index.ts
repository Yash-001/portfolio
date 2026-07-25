// ─────────────────────────────────────────────────────────────────────────────
// src/content/certifications/index.ts
// Professional certifications. Add entries as needed.
// ─────────────────────────────────────────────────────────────────────────────

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

export const CERTIFICATIONS: Certification[] = [
  // Example — replace with real data:
  // {
  //   id: 'aws-saa',
  //   name: 'AWS Certified Solutions Architect – Associate',
  //   issuer: 'Amazon Web Services',
  //   issuedDate: '2023-06',
  //   expiryDate: '2026-06',
  //   credentialUrl: 'https://aws.amazon.com/verification',
  // },
]
