<template>
  <div class="adm">
    <!-- Header -->
    <div class="adm__header">
      <div class="adm__title-row">
        <h1 class="adm__title">
          Clients &amp; Reviews
        </h1>
        <div class="adm__counts">
          <span class="adm__badge">{{ clients.length }} clients</span>
          <span class="adm__badge">{{ reviews.length }} reviews</span>
        </div>
      </div>
    </div>

    <!-- ── Clients ── -->
    <section class="adm__section">
      <div class="adm__section-header">
        <h2 class="adm__section-title">
          Clients
        </h2>
        <div class="adm__section-actions">
          <input
            v-model="clientSearch"
            type="search"
            class="adm__search"
            placeholder="Search clients…"
            @input="loadClients"
          />
          <button
            class="adm__btn adm__btn--primary"
            @click="openClientForm()"
          >
            <i class="pi pi-plus" /> Add Client
          </button>
        </div>
      </div>

      <div class="adm__table-wrap">
        <table class="adm__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Status</th>
              <th>Reviews</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="clientsLoading">
              <td
                colspan="6"
                class="adm__loading-cell"
              >
                <span class="adm__spinner" /> Loading…
              </td>
            </tr>
            <tr v-else-if="clients.length === 0">
              <td
                colspan="6"
                class="adm__empty-cell"
              >
                No clients yet.
              </td>
            </tr>
            <tr
              v-for="c in clients"
              :key="c.id"
            >
              <td class="adm__td-name">
                {{ c.name }}
              </td>
              <td class="adm__td-mono">
                {{ c.email }}
              </td>
              <td>{{ c.company ?? '—' }}</td>
              <td>
                <span
                  class="adm__status"
                  :class="c.active ? 'adm__status--active' : 'adm__status--inactive'"
                >
                  {{ c.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ c.review_count }}</td>
              <td class="adm__td-actions">
                <button
                  class="adm__icon-btn"
                  title="Edit"
                  @click="openClientForm(c)"
                >
                  <i class="pi pi-pencil" />
                </button>
                <button
                  class="adm__icon-btn adm__icon-btn--danger"
                  title="Delete"
                  @click="deleteClient(c.id)"
                >
                  <i class="pi pi-trash" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ── Reviews ── -->
    <section class="adm__section">
      <div class="adm__section-header">
        <h2 class="adm__section-title">
          Reviews
        </h2>
        <div class="adm__section-actions">
          <input
            v-model="reviewSearch"
            type="search"
            class="adm__search"
            placeholder="Search reviews…"
            @input="loadReviews"
          />
          <button
            class="adm__btn adm__btn--primary"
            @click="openReviewForm()"
          >
            <i class="pi pi-plus" /> Add Review
          </button>
        </div>
      </div>

      <div class="adm__table-wrap">
        <table class="adm__table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Company</th>
              <th>Review</th>
              <th>Rating</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reviewsLoading">
              <td
                colspan="6"
                class="adm__loading-cell"
              >
                <span class="adm__spinner" /> Loading…
              </td>
            </tr>
            <tr v-else-if="reviews.length === 0">
              <td
                colspan="6"
                class="adm__empty-cell"
              >
                No reviews yet.
              </td>
            </tr>
            <tr
              v-for="r in reviews"
              :key="r.id"
            >
              <td class="adm__td-name">
                {{ r.client_name }}
              </td>
              <td>{{ r.company ?? '—' }}</td>
              <td class="adm__td-review">
                {{ r.review_text }}
              </td>
              <td>
                <span class="adm__stars">
                  <svg
                    v-for="n in 5"
                    :key="n"
                    class="adm__star-svg"
                    :class="n <= r.rating ? 'adm__star-svg--lit' : 'adm__star-svg--dim'"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </span>
              </td>
              <td class="adm__td-mono">
                {{ formatDate(r.created_at) }}
              </td>
              <td class="adm__td-actions">
                <button
                  class="adm__icon-btn"
                  title="Edit"
                  @click="openReviewForm(r)"
                >
                  <i class="pi pi-pencil" />
                </button>
                <button
                  class="adm__icon-btn adm__icon-btn--danger"
                  title="Delete"
                  @click="deleteReview(r.id)"
                >
                  <i class="pi pi-trash" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ── Client form modal ── -->
    <Teleport to="body">
      <Transition name="adm-fade">
        <div
          v-if="clientFormOpen"
          class="adm-modal-backdrop"
          @click.self="clientFormOpen = false"
        >
          <div class="adm-modal">
            <div class="adm-modal__header">
              <span>{{ editingClient ? 'Edit Client' : 'Add Client' }}</span>
              <button
                class="adm__icon-btn"
                @click="clientFormOpen = false"
              >
                <i class="pi pi-times" />
              </button>
            </div>
            <div class="adm-modal__body">
              <div class="adm-field">
                <label class="adm-label">Name *</label>
                <input
                  v-model="cf.name"
                  class="adm-input"
                  placeholder="Full name"
                />
                <span
                  v-if="cfErrors.name"
                  class="adm-error"
                >{{ cfErrors.name }}</span>
              </div>
              <div class="adm-field">
                <label class="adm-label">Email *</label>
                <input
                  v-model="cf.email"
                  class="adm-input"
                  placeholder="client@example.com"
                  type="email"
                />
                <span
                  v-if="cfErrors.email"
                  class="adm-error"
                >{{ cfErrors.email }}</span>
              </div>
              <div class="adm-field">
                <label class="adm-label">Company</label>
                <input
                  v-model="cf.company"
                  class="adm-input"
                  placeholder="Company name (optional)"
                />
              </div>
              <div class="adm-field">
                <label class="adm-label">Role / Title</label>
                <input
                  v-model="cf.role"
                  class="adm-input"
                  placeholder="e.g. CTO, VP Engineering (optional)"
                />
              </div>
              <div class="adm-field">
                <label class="adm-label">Location</label>
                <input
                  v-model="cf.location"
                  class="adm-input"
                  placeholder="e.g. Mumbai, India (optional)"
                />
              </div>
              <div class="adm-field">
                <label class="adm-label">Engagement Type</label>
                <input
                  v-model="cf.engagement_type"
                  class="adm-input"
                  placeholder="e.g. Backend Architecture · 3 months (optional)"
                />
              </div>
              <div class="adm-field adm-field--row">
                <label class="adm-label">Active</label>
                <input
                  v-model="cf.active"
                  type="checkbox"
                  class="adm-checkbox"
                />
              </div>
              <span
                v-if="cfErrors.general"
                class="adm-error"
              >{{ cfErrors.general }}</span>
            </div>
            <div class="adm-modal__footer">
              <button
                class="adm__btn"
                @click="clientFormOpen = false"
              >
                Cancel
              </button>
              <button
                class="adm__btn adm__btn--primary"
                :disabled="cfSaving"
                @click="saveClient"
              >
                <span
                  v-if="cfSaving"
                  class="adm__spinner"
                />
                {{ cfSaving ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ── Review form modal ── -->
      <Transition name="adm-fade">
        <div
          v-if="reviewFormOpen"
          class="adm-modal-backdrop"
          @click.self="reviewFormOpen = false"
        >
          <div class="adm-modal">
            <div class="adm-modal__header">
              <span>{{ editingReview ? 'Edit Review' : 'Add Review' }}</span>
              <button
                class="adm__icon-btn"
                @click="reviewFormOpen = false"
              >
                <i class="pi pi-times" />
              </button>
            </div>
            <div class="adm-modal__body">
              <div
                v-if="!editingReview"
                class="adm-field"
              >
                <label class="adm-label">Client *</label>
                <select
                  v-model="rf.client_id"
                  class="adm-input adm-select"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select client…
                  </option>
                  <option
                    v-for="c in clients"
                    :key="c.id"
                    :value="c.id"
                  >
                    {{ c.name }}{{ c.company ? ` — ${c.company}` : '' }}
                  </option>
                </select>
                <span
                  v-if="rfErrors.client_id"
                  class="adm-error"
                >{{ rfErrors.client_id }}</span>
              </div>
              <div class="adm-field">
                <label class="adm-label">
                  Review *
                  <span
                    class="adm-char-count"
                    :class="{ 'adm-char-count--warn': rf.review_text.length > 270 }"
                  >{{ rf.review_text.length }}/300</span>
                </label>
                <textarea
                  v-model="rf.review_text"
                  class="adm-input adm-textarea"
                  rows="5"
                  placeholder="Review text… (max 300 characters)"
                  maxlength="300"
                />
                <span
                  v-if="rfErrors.review_text"
                  class="adm-error"
                >{{ rfErrors.review_text }}</span>
              </div>
              <div class="adm-field">
                <label class="adm-label">Project / Work Type</label>
                <input
                  v-model="rf.project_ref"
                  class="adm-input"
                  placeholder="e.g. Code Review, Cloud Infra, AI Integration (optional)"
                />
              </div>
              <div class="adm-field">
                <label class="adm-label">
                  Rating
                  <span class="adm-rating-label">{{ RATING_LABELS[String(rfDisplay)] ?? '' }}</span>
                </label>
                <div class="adm__star-row" @mouseleave="rfHover = 0">
                  <div
                    v-for="n in 5"
                    :key="n"
                    class="adm__star-wrap"
                    @mousemove="onRfStarMove(n, $event)"
                    @click="onRfStarClick(n, $event)"
                  >
                    <svg width="0" height="0" style="position:absolute">
                      <defs>
                        <clipPath :id="`adm-half-${n}`">
                          <rect x="0" y="0" width="12" height="24" />
                        </clipPath>
                      </defs>
                    </svg>
                    <svg class="adm__star-base" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="rgba(180,140,0,0.15)" stroke="#c8a000" stroke-width="1.2" stroke-opacity="0.8" />
                    </svg>
                    <svg v-if="rfDisplay >= n" class="adm__star-lit" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b" />
                    </svg>
                    <svg v-else-if="rfDisplay >= n - 0.5" class="adm__star-lit" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="#f59e0b" :clip-path="`url(#adm-half-${n})`" />
                    </svg>
                  </div>
                </div>
                <span class="adm-rating-value">{{ rfDisplay }} / 5</span>
              </div>
              <span
                v-if="rfErrors.general"
                class="adm-error"
              >{{ rfErrors.general }}</span>
            </div>
            <div class="adm-modal__footer">
              <button
                class="adm__btn"
                @click="reviewFormOpen = false"
              >
                Cancel
              </button>
              <button
                class="adm__btn adm__btn--primary"
                :disabled="rfSaving"
                @click="saveReview"
              >
                <span
                  v-if="rfSaving"
                  class="adm__spinner"
                />
                {{ rfSaving ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  adminGetClients, adminCreateClient, adminUpdateClient, adminDeleteClient,
  adminGetReviews, adminCreateReview, adminUpdateReview, adminDeleteReview,
  type AdminClient, type AdminReview,
} from '@/services/review.service'

// ── Clients ───────────────────────────────────────────────────────
const clients = ref<AdminClient[]>([])
const clientsLoading = ref(false)
const clientSearch = ref('')

async function loadClients() {
  clientsLoading.value = true
  try { clients.value = await adminGetClients(clientSearch.value) }
  catch { clients.value = [] }
  finally { clientsLoading.value = false }
}

// ── Reviews ───────────────────────────────────────────────────────
const reviews = ref<AdminReview[]>([])
const reviewsLoading = ref(false)
const reviewSearch = ref('')

async function loadReviews() {
  reviewsLoading.value = true
  try { reviews.value = await adminGetReviews(reviewSearch.value) }
  catch { reviews.value = [] }
  finally { reviewsLoading.value = false }
}

onMounted(() => { loadClients(); loadReviews() })

// ── Client form ───────────────────────────────────────────────────
const clientFormOpen = ref(false)
const editingClient = ref<AdminClient | null>(null)
const cfSaving = ref(false)
const cf = reactive({ name: '', email: '', company: '', role: '', location: '', engagement_type: '', active: true })
const cfErrors = reactive({ name: '', email: '', general: '' })

function openClientForm(c?: AdminClient) {
  editingClient.value = c ?? null
  cf.name = c?.name ?? ''
  cf.email = c?.email ?? ''
  cf.company = c?.company ?? ''
  cf.role = c?.role ?? ''
  cf.location = c?.location ?? ''
  cf.engagement_type = c?.engagement_type ?? ''
  cf.active = c ? Boolean(c.active) : true
  cfErrors.name = ''; cfErrors.email = ''; cfErrors.general = ''
  clientFormOpen.value = true
}

async function saveClient() {
  cfErrors.name = ''; cfErrors.email = ''; cfErrors.general = ''
  if (!cf.name.trim()) { cfErrors.name = 'Name is required.'; return }
  if (!cf.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cf.email)) {
    cfErrors.email = 'Valid email is required.'; return
  }
  cfSaving.value = true
  try {
    if (editingClient.value) {
      await adminUpdateClient(editingClient.value.id, {
        name: cf.name, email: cf.email,
        company: cf.company || undefined,
        role: cf.role || undefined,
        location: cf.location || undefined,
        engagement_type: cf.engagement_type || undefined,
        active: cf.active,
      })
    } else {
      await adminCreateClient({
        name: cf.name, email: cf.email,
        company: cf.company || undefined,
        role: cf.role || undefined,
        location: cf.location || undefined,
        engagement_type: cf.engagement_type || undefined,
        active: cf.active,
      })
    }
    clientFormOpen.value = false
    await loadClients()
  } catch (e: unknown) {
    cfErrors.general = e instanceof Error ? e.message : 'Failed to save.'
  } finally {
    cfSaving.value = false
  }
}

async function deleteClient(id: number) {
  if (!confirm('Delete this client and their review?')) return
  try { await adminDeleteClient(id); await loadClients(); await loadReviews() }
  catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed to delete.') }
}

// ── Rating labels (shared scale) ─────────────────────────────────
const RATING_LABELS: Record<string, string> = {
  '0.5': 'Dreadful', '1': 'Terrible', '1.5': 'Poor',
  '2': 'Fair', '2.5': 'Average', '3': 'Good',
  '3.5': 'Very Good', '4': 'Excellent', '4.5': 'Outstanding', '5': 'Incredible',
}

// ── Review form ───────────────────────────────────────────────────
const reviewFormOpen = ref(false)
const editingReview = ref<AdminReview | null>(null)
const rfSaving = ref(false)
const rf = reactive({ client_id: 0, review_text: '', rating: 5, project_ref: '' })
const rfErrors = reactive({ client_id: '', review_text: '', general: '' })
const rfHover = ref(0)
const rfDisplay = computed(() => rfHover.value || rf.rating)

function onRfStarMove(n: number, e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  rfHover.value = (e.clientX - rect.left) / rect.width < 0.5 ? n - 0.5 : n
}
function onRfStarClick(n: number, e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  rf.rating = (e.clientX - rect.left) / rect.width < 0.5 ? n - 0.5 : n
}

function openReviewForm(r?: AdminReview) {
  editingReview.value = r ?? null
  rf.client_id = r?.client_id ?? 0
  rf.review_text = r?.review_text ?? ''
  rf.rating = r?.rating ?? 5
  rf.project_ref = r?.project_ref ?? ''
  rfErrors.client_id = ''; rfErrors.review_text = ''; rfErrors.general = ''
  reviewFormOpen.value = true
}

async function saveReview() {
  rfErrors.client_id = ''; rfErrors.review_text = ''; rfErrors.general = ''
  if (!editingReview.value && !rf.client_id) { rfErrors.client_id = 'Select a client.'; return }
  if (rf.review_text.trim().length < 20) { rfErrors.review_text = 'Review must be at least 20 characters.'; return }
  if (rf.review_text.trim().length > 300) { rfErrors.review_text = 'Review must be at most 300 characters.'; return }
  rfSaving.value = true
  try {
    if (editingReview.value) {
      await adminUpdateReview(editingReview.value.id, {
        review_text: rf.review_text,
        rating: Math.round(rf.rating),
        project_ref: rf.project_ref || undefined,
      })
    } else {
      await adminCreateReview({
        client_id: rf.client_id,
        review_text: rf.review_text,
        rating: Math.round(rf.rating),
        project_ref: rf.project_ref || undefined,
      })
    }
    reviewFormOpen.value = false
    await loadReviews()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to save.'
    rfErrors.general = msg.toLowerCase().includes('already has a review')
      ? 'This client already has a review. Please edit their existing review instead.'
      : msg
  } finally {
    rfSaving.value = false
  }
}

async function deleteReview(id: number) {
  if (!confirm('Delete this review?')) return
  try { await adminDeleteReview(id); await loadReviews() }
  catch (e: unknown) { alert(e instanceof Error ? e.message : 'Failed to delete.') }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.adm {
  max-width: 1280px; margin: 0 auto;
  padding: 40px 24px 80px;
  min-height: 100vh;
  background: #0a0a0a;
  color: #e5e5e5;
}

.adm__header { margin-bottom: 40px; }
.adm__title-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.adm__title { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: #f5f5f5; }
.adm__counts { display: flex; gap: 8px; }
.adm__badge {
  padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600;
  font-family: 'Geist Mono', monospace;
  border: 1px solid rgba(99,102,241,0.3); background: rgba(99,102,241,0.08); color: #a5b4fc;
}

.adm__section { margin-bottom: 56px; }
.adm__section-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
}
.adm__section-title { font-size: 18px; font-weight: 700; color: #f5f5f5; }
.adm__section-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.adm__search {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #e5e5e5;
  font-family: inherit; outline: none; width: 200px;
  transition: border-color 0.2s;
}
.adm__search:focus { border-color: rgba(99,102,241,0.5); }
.adm__search::placeholder { color: #444; }

.adm__btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04); color: #d4d4d4;
  transition: all 0.2s;
}
.adm__btn:hover { border-color: rgba(99,102,241,0.4); color: #a5b4fc; }
.adm__btn--primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent; color: #fff;
  box-shadow: 0 2px 12px rgba(99,102,241,0.3);
}
.adm__btn--primary:hover { box-shadow: 0 4px 20px rgba(99,102,241,0.5); }
.adm__btn:disabled { opacity: 0.6; cursor: not-allowed; }

.adm__table-wrap { overflow-x: auto; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06); }
.adm__table { width: 100%; border-collapse: collapse; font-size: 13px; }
.adm__table th {
  padding: 12px 16px; text-align: left;
  font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: #555; font-family: 'Geist Mono', monospace;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.adm__table td {
  padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
  color: #c0c0c0; vertical-align: top;
}
.adm__table tr:last-child td { border-bottom: none; }
.adm__table tr:hover td { background: rgba(255,255,255,0.02); }

.adm__td-name { font-weight: 600; color: #e5e5e5; }
.adm__td-mono { font-family: 'Geist Mono', monospace; font-size: 12px; color: #737373; }
.adm__td-review { max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.adm__td-actions { display: flex; gap: 6px; }

.adm__loading-cell, .adm__empty-cell {
  text-align: center; padding: 40px; color: #444; font-size: 13px;
}
.adm__loading-cell { display: flex; align-items: center; justify-content: center; gap: 8px; }

.adm__status {
  display: inline-block; padding: 3px 10px; border-radius: 100px;
  font-size: 11px; font-weight: 600; font-family: 'Geist Mono', monospace;
}
.adm__status--active { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
.adm__status--inactive { background: rgba(239,68,68,0.08); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

.adm__stars { display: flex; gap: 2px; align-items: center; }
.adm__star-svg { width: 13px; height: 13px; display: block; }
.adm__star-svg--lit { fill: #f59e0b; filter: drop-shadow(0 0 3px rgba(245,158,11,0.5)); }
.adm__star-svg--dim { fill: rgba(180,140,0,0.3); stroke: rgba(200,160,0,0.5); stroke-width: 1px; }
.adm__star-row { display: flex; gap: 4px; padding: 4px 0; }
.adm__star-wrap {
  position: relative; width: 34px; height: 34px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.12s;
}
.adm__star-wrap:hover { transform: scale(1.18); }
.adm__star-base, .adm__star-lit {
  position: absolute; width: 28px; height: 28px; display: block;
}
.adm__star-base { filter: drop-shadow(0 0 1px rgba(200,160,0,0.4)); }
.adm__star-lit  { filter: drop-shadow(0 0 4px rgba(245,158,11,0.6)); }
.adm-rating-label {
  font-size: 11px; color: #f59e0b; font-family: 'Geist Mono', monospace;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.adm-rating-value { font-size: 11px; color: #555; font-family: 'Geist Mono', monospace; }

.adm__icon-btn {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid rgba(255,255,255,0.08); background: transparent;
  color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 12px; transition: all 0.2s;
}
.adm__icon-btn:hover { border-color: rgba(99,102,241,0.4); color: #a5b4fc; background: rgba(99,102,241,0.08); }
.adm__icon-btn--danger:hover { border-color: rgba(239,68,68,0.4); color: #f87171; background: rgba(239,68,68,0.06); }

.adm__spinner {
  width: 13px; height: 13px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  animation: admSpin 0.7s linear infinite; display: inline-block;
}
@keyframes admSpin { to { transform: rotate(360deg); } }

/* ── Modal ── */
.adm-modal-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.adm-modal {
  width: min(520px, 100%); border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(17,17,17,0.98); backdrop-filter: blur(24px);
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
  overflow: hidden;
}
.adm-modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 15px; font-weight: 700; color: #f5f5f5;
}
.adm-modal__body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.adm-modal__footer {
  padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.06);
  display: flex; justify-content: flex-end; gap: 10px;
}

.adm-field { display: flex; flex-direction: column; gap: 6px; }
.adm-field--row { flex-direction: row; align-items: center; gap: 12px; }
.adm-label { font-size: 12px; font-weight: 600; color: #a0a0a0; font-family: 'Geist Mono', monospace; letter-spacing: 0.04em; display: flex; align-items: center; justify-content: space-between; }
.adm-char-count { font-size: 11px; color: #444; font-family: 'Geist Mono', monospace; }
.adm-char-count--warn { color: #f87171; }
.adm-input {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 9px; padding: 10px 13px; font-size: 13px; color: #e5e5e5;
  font-family: inherit; outline: none; transition: border-color 0.2s;
  width: 100%; box-sizing: border-box;
}
.adm-input:focus { border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.adm-input::placeholder { color: #444; }
.adm-select { appearance: none; cursor: pointer; background: #1a1a1a; color: #e5e5e5; }
.adm-select option { background: #1a1a1a; color: #e5e5e5; }
.adm-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
.adm-checkbox { width: 16px; height: 16px; cursor: pointer; accent-color: #6366f1; }
.adm-error { font-size: 12px; color: #f87171; }

.adm-fade-enter-active { transition: opacity 0.2s ease; }
.adm-fade-leave-active { transition: opacity 0.15s ease; }
.adm-fade-enter-from, .adm-fade-leave-to { opacity: 0; }
</style>
