// src/services/review.service.ts
// Typed API client for the review system.
// All calls go to VITE_AI_SERVICE_URL (same backend as AI chat).

const BASE = (import.meta.env.VITE_AI_SERVICE_URL as string | undefined) ?? 'http://localhost:8000'
const ADMIN_KEY = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined) ?? ''

export interface PublicReview {
  id: number
  client_name: string
  company: string | null
  role: string | null
  location: string | null
  engagement_type: string | null
  review_text: string
  rating: number
  project_ref: string | null
  created_at: string
  updated_at: string
}

export interface ValidateEmailResult {
  verified: boolean
  message: string
  client_name?: string
}

export interface SubmitReviewResult {
  updated: boolean
  message: string
}

export interface AdminClient {
  id: number
  name: string
  email: string
  company: string | null
  role: string | null
  location: string | null
  engagement_type: string | null
  active: number
  created_at: string
  review_count: number
}

export interface AdminReview {
  id: number
  client_id: number
  client_name: string
  company: string | null
  review_text: string
  rating: number
  project_ref: string | null
  created_at: string
  updated_at: string
}

async function _post<T>(path: string, body: unknown, adminKey = ''): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(adminKey ? { 'X-Admin-Key': adminKey } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

async function _get<T>(path: string, adminKey = ''): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

async function _put<T>(path: string, body: unknown, adminKey = ''): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(adminKey ? { 'X-Admin-Key': adminKey } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

async function _delete<T>(path: string, adminKey = ''): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    method: 'DELETE',
    headers: adminKey ? { 'X-Admin-Key': adminKey } : {},
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

// ── Public ────────────────────────────────────────────────────────────────────

export function validateEmail(email: string): Promise<ValidateEmailResult> {
  return _post('/reviews/validate-email', { email })
}

export function submitReview(email: string, review_text: string, rating: number): Promise<SubmitReviewResult> {
  return _post('/reviews', { email, review_text, rating })
}

export function getPublicReviews(): Promise<PublicReview[]> {
  return _get('/reviews/public')
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function adminGetClients(search = ''): Promise<AdminClient[]> {
  const q = search ? `?search=${encodeURIComponent(search)}` : ''
  return _get(`/admin/clients${q}`, ADMIN_KEY)
}

export function adminCreateClient(data: {
  name: string; email: string; company?: string
  role?: string; location?: string; engagement_type?: string; active?: boolean
}): Promise<{ id: number; message: string }> {
  return _post('/admin/clients', data, ADMIN_KEY)
}

export function adminUpdateClient(id: number, data: Partial<{
  name: string; email: string; company: string
  role: string; location: string; engagement_type: string; active: boolean
}>): Promise<{ message: string }> {
  return _put(`/admin/clients/${id}`, data, ADMIN_KEY)
}

export function adminDeleteClient(id: number): Promise<{ message: string }> {
  return _delete(`/admin/clients/${id}`, ADMIN_KEY)
}

export function adminGetReviews(search = ''): Promise<AdminReview[]> {
  const q = search ? `?search=${encodeURIComponent(search)}` : ''
  return _get(`/admin/reviews${q}`, ADMIN_KEY)
}

export function adminCreateReview(data: {
  client_id: number; review_text: string; rating: number; project_ref?: string
}): Promise<{ id: number; message: string }> {
  return _post('/admin/reviews', data, ADMIN_KEY)
}

export function adminUpdateReview(id: number, data: Partial<{
  review_text: string; rating: number; project_ref: string
}>): Promise<{ message: string }> {
  return _put(`/admin/reviews/${id}`, data, ADMIN_KEY)
}

export function adminDeleteReview(id: number): Promise<{ message: string }> {
  return _delete(`/admin/reviews/${id}`, ADMIN_KEY)
}
