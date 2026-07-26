<template>
  <Teleport to="body">
    <Transition name="chat-dialog">
      <div
        v-if="chat.isOpen"
        ref="dialogRef"
        class="ai-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Portfolio AI Assistant"
        tabindex="-1"
        @keydown.esc="chat.close"
        @keydown="trapFocus"
      >
        <!-- Header -->
        <header class="ai-dialog__header">
          <div class="ai-dialog__header-left">
            <div
              class="ai-dialog__avatar"
              aria-hidden="true"
            >
              <i class="pi pi-microchip-ai" />
              <span
                class="ai-dialog__status-dot"
                :class="{ 'ai-dialog__status-dot--active': !chat.isStreaming }"
              />
            </div>
            <div>
              <p class="ai-dialog__title">
                Portfolio Assistant
              </p>
              <p class="ai-dialog__subtitle">
                {{ chat.isStreaming ? 'Typing…' : chat.hasMessages ? `${chat.messageCount} messages` : 'Ask me anything' }}
              </p>
            </div>
          </div>

          <div class="ai-dialog__header-right">
            <!-- Export -->
            <button
              v-if="chat.hasMessages && !chat.isStreaming"
              class="ai-dialog__icon-btn"
              title="Export conversation"
              aria-label="Export conversation as Markdown"
              @click="chat.exportChat('md')"
            >
              <i class="pi pi-download" />
            </button>

            <!-- New conversation -->
            <button
              v-if="chat.hasMessages && !confirmingReset"
              class="ai-dialog__icon-btn"
              title="New conversation"
              aria-label="Start new conversation"
              @click="confirmReset"
            >
              <i class="pi pi-plus-circle" />
            </button>

            <!-- Clear -->
            <button
              v-if="chat.hasMessages"
              class="ai-dialog__icon-btn"
              title="Clear conversation"
              aria-label="Clear conversation"
              @click="chat.clear"
            >
              <i class="pi pi-trash" />
            </button>

            <button
              class="ai-dialog__icon-btn"
              title="Close (Esc)"
              aria-label="Close chat"
              @click="chat.close"
            >
              <i class="pi pi-times" />
            </button>
          </div>
        </header>

        <!-- Inline reset confirmation (replaces window.confirm) -->
        <div
          v-if="confirmingReset"
          class="ai-dialog__confirm"
          role="alertdialog"
          aria-label="Confirm new conversation"
        >
          <p class="ai-dialog__confirm-text">
            Start a new conversation? Current one will be saved.
          </p>
          <div class="ai-dialog__confirm-actions">
            <button
              class="ai-dialog__confirm-btn ai-dialog__confirm-btn--cancel"
              @click="cancelReset"
            >
              Cancel
            </button>
            <button
              class="ai-dialog__confirm-btn ai-dialog__confirm-btn--ok"
              @click="doReset"
            >
              Start new
            </button>
          </div>
        </div>

        <!-- Context warning for long conversations -->
        <div
          v-if="showContextWarning"
          class="ai-dialog__context-warn"
        >
          <i class="pi pi-info-circle" />
          Long conversation — older messages may be summarised to fit context.
        </div>

        <!-- Messages -->
        <div
          ref="scrollRef"
          class="ai-dialog__messages"
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          <!-- Empty state -->
          <div
            v-if="!chat.hasMessages"
            class="ai-dialog__empty"
          >
            <div
              class="ai-dialog__empty-icon"
              aria-hidden="true"
            >
              <i class="pi pi-microchip-ai" />
            </div>
            <p class="ai-dialog__empty-title">
              Hi, I'm Yash's AI assistant
            </p>
            <p class="ai-dialog__empty-sub">
              Ask me about his projects, skills, services, or availability.
            </p>
          </div>

          <!-- Message list -->
          <template v-else>
            <AiChatMessage
              v-for="msg in chat.messages"
              :key="msg.id"
              :message="msg"
            />

            <!-- Retry button -->
            <div
              v-if="chat.lastMessage?.status === 'error'"
              class="ai-dialog__retry"
            >
              <button
                class="ai-dialog__retry-btn"
                @click="chat.retry"
              >
                <i class="pi pi-refresh" />
                Retry
              </button>
            </div>
          </template>
        </div>

        <!-- Suggested questions (empty state) -->
        <AiSuggestedQuestions
          v-if="!chat.hasMessages"
          :questions="INITIAL_SUGGESTIONS"
          @select="handleSuggestion"
        />

        <!-- Follow-up questions (after assistant replies) -->
        <AiSuggestedQuestions
          v-else-if="chat.followUps.length && !chat.isStreaming"
          :questions="chat.followUps"
          label="Follow up"
          @select="handleSuggestion"
        />

        <!-- Input -->
        <footer class="ai-dialog__footer">
          <AiChatInput
            ref="inputRef"
            :disabled="!chat.canSend"
            :is-streaming="chat.isStreaming"
            placeholder="Ask about projects, skills, availability…"
            @send="chat.send"
            @cancel="chat.cancel"
          />
          <p class="ai-dialog__hint">
            <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> new line · <kbd>Esc</kbd> to close
          </p>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat.store'
import AiChatMessage from './AiChatMessage.vue'
import AiChatInput from './AiChatInput.vue'
import AiSuggestedQuestions from './AiSuggestedQuestions.vue'

const chat      = useChatStore()
const scrollRef = ref<HTMLElement | null>(null)
const inputRef  = ref<InstanceType<typeof AiChatInput> | null>(null)
const dialogRef = ref<HTMLElement | null>(null)
const confirmingReset = ref(false)

const INITIAL_SUGGESTIONS = [
  'Tell me about this candidate',
  'Summarise his experience',
  'List his backend experience',
  'List his AI experience',
  'Show his cloud projects',
  'Generate interview questions',
]

/** Show context warning when conversation is getting long (>16 done messages). */
const showContextWarning = computed(() => chat.messageCount > 16)

function scrollToBottom(smooth = true) {
  nextTick(() => {
    const el = scrollRef.value
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' })
  })
}

function handleSuggestion(q: string) {
  chat.send(q)
}

function confirmReset() {
  confirmingReset.value = true
}
function doReset() {
  confirmingReset.value = false
  chat.reset()
}
function cancelReset() {
  confirmingReset.value = false
}

// ── Focus trap ────────────────────────────────────────────────────────────────
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function trapFocus(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !dialogRef.value) return
  const focusable = Array.from(dialogRef.value.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter(el => !el.hasAttribute('disabled'))
  if (!focusable.length) return
  const first = focusable[0]
  const last  = focusable[focusable.length - 1]
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus() }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus() }
  }
}

// Auto-scroll on new messages / streaming content
watch(
  () => chat.messages.map(m => m.content).join(''),
  () => scrollToBottom(),
)

// Start a fresh conversation only when dialog opens with no existing messages
watch(
  () => chat.isOpen,
  (open) => {
    if (open) {
      if (!chat.isStreaming && !chat.hasMessages) chat.reset()
      nextTick(() => {
        dialogRef.value?.focus()
        inputRef.value?.focus()
        scrollToBottom(false)
      })
    }
  },
)

// Global keyboard shortcut: Cmd/Ctrl+K to toggle
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    chat.toggle()
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.ai-dialog {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 400px;
  max-width: calc(100vw - 32px);
  height: 580px;
  max-height: calc(100dvh - 110px);
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: 20px;
  box-shadow: var(--shadow-modal);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9000;
}

/* Transition */
.chat-dialog-enter-active { animation: dialog-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.chat-dialog-leave-active { animation: dialog-out 0.18s cubic-bezier(0.25, 1, 0.5, 1); }

@keyframes dialog-in {
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes dialog-out {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(10px) scale(0.97); }
}

/* Header */
.ai-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}
.ai-dialog__header-left { display: flex; align-items: center; gap: 10px; }
.ai-dialog__header-right { display: flex; align-items: center; gap: 4px; }

.ai-dialog__avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-primary-muted);
  border: 1px solid rgba(99,102,241,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 16px;
  flex-shrink: 0;
}
.ai-dialog__status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--text-tertiary);
  border: 2px solid var(--bg-primary);
  transition: background 0.3s;
}
.ai-dialog__status-dot--active { background: var(--color-success); }

.ai-dialog__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}
.ai-dialog__subtitle {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.2;
}

.ai-dialog__icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all 0.15s;
}
.ai-dialog__icon-btn:hover { background: var(--bg-elevated); color: var(--text-primary); }
.ai-dialog__icon-btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }

/* Context warning */
.ai-dialog__context-warn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 11.5px;
  color: var(--color-warning);
  background: rgba(234,179,8,0.06);
  border-bottom: 1px solid rgba(234,179,8,0.15);
  flex-shrink: 0;
}

/* Messages */
.ai-dialog__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scroll-behavior: smooth;
}
.ai-dialog__messages::-webkit-scrollbar { width: 4px; }
.ai-dialog__messages::-webkit-scrollbar-track { background: transparent; }
.ai-dialog__messages::-webkit-scrollbar-thumb { background: var(--border-active); border-radius: 2px; }

/* Empty state */
.ai-dialog__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: 24px;
}
.ai-dialog__empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: var(--color-primary-muted);
  border: 1px solid rgba(99,102,241,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--color-primary);
  margin-bottom: 4px;
}
.ai-dialog__empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.ai-dialog__empty-sub {
  font-size: 13px;
  color: var(--text-secondary);
  max-width: 260px;
  line-height: 1.5;
}

/* Retry */
.ai-dialog__retry { display: flex; justify-content: center; }
.ai-dialog__retry-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}
.ai-dialog__retry-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.ai-dialog__retry-btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }

/* Footer */
.ai-dialog__footer {
  padding: 12px 14px 14px;
  border-top: 1px solid var(--border-subtle);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ai-dialog__hint {
  font-size: 11px;
  color: var(--text-tertiary);
  text-align: center;
}
.ai-dialog__hint kbd {
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
}

/* Mobile */
@media (max-width: 480px) {
  .ai-dialog {
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    max-width: 100%;
    height: 85dvh;
    max-height: 85dvh;
    border-radius: 20px 20px 0 0;
  }
}

/* Inline reset confirmation */
.ai-dialog__confirm {
  padding: 10px 16px 12px;
  background: var(--bg-overlay);
  border-bottom: 1px solid var(--border-default);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ai-dialog__confirm-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}
.ai-dialog__confirm-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.ai-dialog__confirm-btn {
  font-size: 12.5px;
  padding: 5px 14px;
  border-radius: 7px;
  border: 1px solid var(--border-default);
  cursor: pointer;
  transition: all 0.15s;
}
.ai-dialog__confirm-btn--cancel {
  background: transparent;
  color: var(--text-secondary);
}
.ai-dialog__confirm-btn--cancel:hover { background: var(--bg-elevated); }
.ai-dialog__confirm-btn--ok {
  background: var(--color-primary);
  color: #fff;
  border-color: transparent;
}
.ai-dialog__confirm-btn--ok:hover { opacity: 0.88; }
.ai-dialog__confirm-btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
</style>
