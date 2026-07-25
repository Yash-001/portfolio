<template>
  <div
    class="ai-input"
    :class="{ 'ai-input--disabled': disabled }"
  >
    <textarea
      ref="textareaRef"
      v-model="draft"
      class="ai-input__textarea"
      :placeholder="placeholder"
      :disabled="disabled && !isStreaming"
      :aria-label="placeholder"
      rows="1"
      maxlength="4000"
      @keydown.enter.exact.prevent="submit"
      @keydown.enter.shift.exact="newline"
      @input="autoResize"
    />

    <div class="ai-input__actions">
      <span
        v-if="draft.length > 3500"
        class="ai-input__count"
        :class="{ 'ai-input__count--warn': draft.length > 3800 }"
      >
        {{ draft.length }}/4000
      </span>

      <!-- Cancel stream -->
      <button
        v-if="isStreaming"
        class="ai-input__btn ai-input__btn--cancel"
        title="Cancel (Esc)"
        aria-label="Cancel response"
        @click="$emit('cancel')"
      >
        <i class="pi pi-stop-circle" />
      </button>

      <!-- Send -->
      <button
        v-else
        class="ai-input__btn ai-input__btn--send"
        :disabled="!draft.trim() || disabled"
        title="Send (Enter)"
        aria-label="Send message"
        @click="submit"
      >
        <i class="pi pi-send" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps<{
  disabled:   boolean
  isStreaming: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  send:   [text: string]
  cancel: []
}>()

const draft       = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function submit() {
  if (!draft.value.trim() || props.disabled) return
  emit('send', draft.value)
  draft.value = ''
  nextTick(autoResize)
}

function newline() {
  draft.value += '\n'
  nextTick(autoResize)
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 140) + 'px'
}

function focus() {
  textareaRef.value?.focus()
}

defineExpose({ focus })
</script>

<style scoped>
.ai-input {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  transition: border-color 0.15s;
}
.ai-input:focus-within { border-color: var(--color-primary); }

.ai-input__textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  font-family: inherit;
  min-height: 22px;
  max-height: 140px;
  overflow-y: auto;
  padding: 0;
}
.ai-input__textarea::placeholder { color: var(--text-tertiary); }
.ai-input__textarea:disabled { opacity: 0.5; cursor: not-allowed; }

.ai-input__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.ai-input__count {
  font-size: 11px;
  color: var(--text-tertiary);
}
.ai-input__count--warn { color: var(--color-warning); }

.ai-input__btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
  flex-shrink: 0;
}
.ai-input__btn--send {
  background: var(--color-primary);
  color: #fff;
}
.ai-input__btn--send:hover:not(:disabled) { background: var(--color-primary-hover); }
.ai-input__btn--send:disabled { opacity: 0.4; cursor: not-allowed; }
.ai-input__btn--cancel {
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid rgba(248,113,113,0.2);
}
.ai-input__btn--cancel:hover { background: rgba(248,113,113,0.15); }
.ai-input__btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
</style>
