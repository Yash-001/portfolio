<template>
  <Teleport to="body">
    <Transition name="rm-fade">
      <div v-if="modelValue" class="rm-backdrop" aria-hidden="true" @click="close" />
    </Transition>

    <Transition name="rm-slide">
      <div v-if="modelValue" class="rm-panel" role="dialog" aria-modal="true" aria-label="Leave a review">

        <div class="rm-header">
          <div class="rm-header__title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>{{ step === 1 ? 'Verify Your Email' : 'Leave a Review' }}</span>
          </div>
          <button class="rm-close" type="button" aria-label="Close" @click="close">
            <i class="pi pi-times" />
          </button>
        </div>

        <!-- Step 1 -->
        <div v-if="step === 1" class="rm-body">
          <p class="rm-desc">Enter the email address you used when working with Yash to verify your identity.</p>

          <div class="rm-field" :class="{ 'rm-field--error': emailError }">
            <label class="rm-label" for="rm-email">Email Address</label>
            <input
              id="rm-email" v-model="email" type="email" class="rm-input"
              placeholder="you@example.com" autocomplete="email"
              :disabled="validating" @keydown.enter.prevent="handleValidate"
            />
            <span v-if="emailError" class="rm-error" role="alert">{{ emailError }}</span>
          </div>

          <button class="rm-btn rm-btn--primary" type="button" :disabled="validating || !email.trim()" @click="handleValidate">
            <span v-if="validating" class="rm-spinner" aria-hidden="true" />
            <i v-else class="pi pi-check-circle" />
            <span>{{ validating ? 'Verifying…' : 'Validate Email' }}</span>
          </button>
        </div>

        <!-- Step 2 -->
        <div v-else class="rm-body">
          <div class="rm-verified-badge">
            <i class="pi pi-verified" style="color:#10b981;" />
            <span>Verified Client: <strong>{{ clientName }}</strong></span>
          </div>

          <div v-if="existingReview" class="rm-existing-notice">
            <i class="pi pi-info-circle" />
            <span>You already have a review. Submitting will update it.</span>
          </div>

          <!-- Half-star rating -->
          <div class="rm-field">
            <label class="rm-label">
              Rating
              <span class="rm-rating-label">{{ activeLabel }}</span>
            </label>
            <div class="rm-stars" @mouseleave="hoverRating = 0">
              <div
                v-for="n in 5"
                :key="n"
                class="rm-star-wrap"
                @mousemove="onStarMove(n, $event)"
                @click="onStarClick(n, $event)"
              >
                <!-- clipPath for half-fill -->
                <svg width="0" height="0" style="position:absolute">
                  <defs>
                    <clipPath :id="`half-${n}`">
                      <rect x="0" y="0" width="12" height="24" />
                    </clipPath>
                  </defs>
                </svg>
                <!-- dim base star (always visible) -->
                <svg class="rm-star-base" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="rgba(180,140,0,0.15)" stroke="#c8a000" stroke-width="1.2" stroke-opacity="0.8" />
                </svg>
                <!-- full lit overlay -->
                <svg
                  v-if="displayRating >= n"
                  class="rm-star-lit rm-star-full"
                  viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="#f59e0b" />
                </svg>
                <!-- half lit overlay -->
                <svg
                  v-else-if="displayRating >= n - 0.5"
                  class="rm-star-lit rm-star-half"
                  viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="#f59e0b" :clip-path="`url(#half-${n})`" />
                </svg>
              </div>
            </div>
            <span class="rm-rating-value">{{ displayRating }} / 5</span>
          </div>

          <!-- Review text -->
          <div class="rm-field" :class="{ 'rm-field--error': reviewError }">
            <label class="rm-label" for="rm-review">
              Your Review
              <span class="rm-char-count" :class="{ 'rm-char-count--warn': reviewText.length > 270 }">
                {{ reviewText.length }}/300
              </span>
            </label>
            <textarea
              id="rm-review" v-model="reviewText" class="rm-input rm-textarea"
              placeholder="Tell us about your experience working with Yash."
              rows="5" maxlength="300" :disabled="submitting"
            />
            <span v-if="reviewError" class="rm-error" role="alert">{{ reviewError }}</span>
          </div>

          <button class="rm-btn rm-btn--primary" type="button" :disabled="submitting || !reviewText.trim()" @click="handleSubmit">
            <span v-if="submitting" class="rm-spinner" aria-hidden="true" />
            <i v-else class="pi pi-send" />
            <span>{{ submitting ? 'Submitting…' : (existingReview ? 'Update Review' : 'Submit Review') }}</span>
          </button>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { validateEmail, submitReview, getPublicReviews } from '@/services/review.service'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'submitted'): void
}>()

const step        = ref(1)
const email       = ref('')
const clientName  = ref('')
const emailError  = ref('')
const validating  = ref(false)

const reviewText     = ref('')
const rating         = ref(5)
const hoverRating    = ref(0)
const reviewError    = ref('')
const submitting     = ref(false)
const existingReview = ref(false)

const displayRating = computed(() => hoverRating.value || rating.value)

const LABELS: Record<string, string> = {
  '0.5': 'Dreadful', '1': 'Terrible', '1.5': 'Poor',
  '2': 'Fair', '2.5': 'Average', '3': 'Good',
  '3.5': 'Very Good', '4': 'Excellent', '4.5': 'Outstanding', '5': 'Incredible',
}
const activeLabel = computed(() => LABELS[String(displayRating.value)] ?? '')

function onStarMove(n: number, e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  hoverRating.value = (e.clientX - rect.left) / rect.width < 0.5 ? n - 0.5 : n
}
function onStarClick(n: number, e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  rating.value = (e.clientX - rect.left) / rect.width < 0.5 ? n - 0.5 : n
}

watch(() => props.modelValue, (open) => {
  if (open) {
    step.value = 1; email.value = ''; clientName.value = ''
    emailError.value = ''; reviewText.value = ''
    rating.value = 5; hoverRating.value = 0
    reviewError.value = ''; existingReview.value = false
  }
})

function close() { emit('update:modelValue', false) }

async function handleValidate() {
  emailError.value = ''
  const trimmed = email.value.trim().toLowerCase()
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    emailError.value = 'Please enter a valid email address.'
    return
  }
  validating.value = true
  try {
    const result = await validateEmail(trimmed)
    if (!result.verified) { emailError.value = result.message; return }
    clientName.value = result.client_name ?? ''
    const reviews = await getPublicReviews()
    existingReview.value = reviews.some((r) => r.client_name === clientName.value)
    step.value = 2
  } catch {
    emailError.value = 'Something went wrong. Please try again.'
  } finally {
    validating.value = false
  }
}

async function handleSubmit() {
  reviewError.value = ''
  const text = reviewText.value.trim()
  if (text.length < 20) { reviewError.value = 'Review must be at least 20 characters.'; return }
  if (text.length > 300) { reviewError.value = 'Review must be at most 300 characters.'; return }
  submitting.value = true
  try {
    await submitReview(email.value.trim().toLowerCase(), text, Math.round(rating.value))
    emit('submitted')
    close()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    reviewError.value = msg.toLowerCase().includes('already has a review')
      ? 'You already have a review on file. Please edit your existing review instead of submitting a new one.'
      : (msg || 'Submission failed. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.rm-backdrop {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);
}
.rm-panel {
  position: fixed; z-index: 901; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: min(480px, calc(100vw - 32px));
  border-radius: 20px; border: 1px solid rgba(255,255,255,0.08);
  background: rgba(17,17,17,0.97); backdrop-filter: blur(24px);
  box-shadow: 0 32px 80px rgba(0,0,0,0.6); overflow: hidden;
}
.rm-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.rm-header__title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #f5f5f5; }
.rm-close {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.08); background: transparent;
  color: #737373; cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 11px; transition: all 0.2s;
}
.rm-close:hover { border-color: rgba(239,68,68,0.4); color: #f87171; }

.rm-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.rm-desc { font-size: 14px; line-height: 1.7; color: #737373; }

.rm-verified-badge {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px;
  border: 1px solid rgba(16,185,129,0.2); background: rgba(16,185,129,0.06);
  font-size: 13px; color: #a7f3d0;
}
.rm-verified-badge strong { color: #f5f5f5; }
.rm-existing-notice {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px;
  border: 1px solid rgba(245,158,11,0.2); background: rgba(245,158,11,0.06);
  font-size: 12px; color: #fcd34d;
}

.rm-field { display: flex; flex-direction: column; gap: 6px; }
.rm-field--error .rm-input { border-color: rgba(239,68,68,0.5); }
.rm-label {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12px; font-weight: 600; color: #a0a0a0;
  font-family: 'Geist Mono', monospace; letter-spacing: 0.04em;
}
.rm-rating-label { font-size: 11px; color: #f59e0b; font-family: 'Geist Mono', monospace; letter-spacing: 0.06em; text-transform: uppercase; min-width: 60px; text-align: right; }
.rm-rating-value { font-size: 11px; color: #555; font-family: 'Geist Mono', monospace; }

/* ── Half-star widget ── */
.rm-stars { display: flex; gap: 4px; padding: 4px 0; }
.rm-star-wrap {
  position: relative; width: 36px; height: 36px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.12s;
}
.rm-star-wrap:hover { transform: scale(1.18); }
.rm-star-base, .rm-star-lit {
  position: absolute; width: 30px; height: 30px; display: block;
}
.rm-star-base { filter: drop-shadow(0 0 1px rgba(200,160,0,0.4)); }
.rm-star-lit  { filter: drop-shadow(0 0 4px rgba(245,158,11,0.6)); }
.rm-star-half { /* clip-path applied inline via SVG clipPath */ }

.rm-input {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; padding: 11px 14px; font-size: 14px; color: #e5e5e5;
  font-family: inherit; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%; box-sizing: border-box;
}
.rm-input::placeholder { color: #444; }
.rm-input:focus { border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.rm-input:disabled { opacity: 0.5; cursor: not-allowed; }
.rm-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }

.rm-char-count { font-size: 11px; color: #555; font-family: 'Geist Mono', monospace; }
.rm-char-count--warn { color: #f87171; }
.rm-error { font-size: 12px; color: #f87171; }

.rm-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 13px 20px; border-radius: 12px;
  border: none; font-size: 14px; font-weight: 700; cursor: pointer;
  letter-spacing: 0.02em; transition: all 0.25s;
}
.rm-btn--primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; box-shadow: 0 4px 20px rgba(99,102,241,0.3);
}
.rm-btn--primary:hover:not(:disabled) { box-shadow: 0 8px 32px rgba(99,102,241,0.5); transform: translateY(-2px); }
.rm-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.rm-spinner {
  width: 15px; height: 15px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  animation: rm-spin 0.7s linear infinite; display: inline-block; flex-shrink: 0;
}
@keyframes rm-spin { to { transform: rotate(360deg); } }

.rm-fade-enter-active, .rm-fade-leave-active { transition: opacity 0.25s ease; }
.rm-fade-enter-from, .rm-fade-leave-to { opacity: 0; }
.rm-slide-enter-active { transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1); }
.rm-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.rm-slide-enter-from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
.rm-slide-leave-to   { opacity: 0; transform: translate(-50%, calc(-50% - 10px)); }
</style>
