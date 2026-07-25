<template>
  <button
    class="ai-fab"
    :class="{ 'ai-fab--open': chat.isOpen, 'ai-fab--has-messages': chat.hasMessages }"
    :aria-label="chat.isOpen ? 'Close AI assistant' : 'Open AI assistant (Ctrl+K)'"
    :aria-expanded="chat.isOpen"
    :title="chat.isOpen ? 'Close' : 'AI Assistant (Ctrl+K)'"
    @click="chat.toggle"
  >
    <!-- Pulse ring (shown when closed and no messages) -->
    <span v-if="!chat.isOpen && !chat.hasMessages" class="ai-fab__pulse" aria-hidden="true" />

    <!-- Icon -->
    <Transition name="fab-icon" mode="out-in">
      <i v-if="chat.isOpen" key="close" class="pi pi-times ai-fab__icon" />
      <i v-else key="open" class="pi pi-microchip-ai ai-fab__icon" />
    </Transition>

    <!-- Unread dot -->
    <span
      v-if="!chat.isOpen && chat.hasMessages"
      class="ai-fab__badge"
      aria-label="New messages"
    />
  </button>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat.store'
const chat = useChatStore()
</script>

<style scoped>
.ai-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  border: none;
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9001;
  box-shadow: 0 4px 20px rgba(99,102,241,0.4), 0 2px 8px rgba(0,0,0,0.3);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.2s,
              background 0.2s,
              border-radius 0.2s;
}
.ai-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(99,102,241,0.5), 0 2px 10px rgba(0,0,0,0.3);
}
.ai-fab:active { transform: scale(0.96); }
.ai-fab--open {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  box-shadow: var(--shadow-elevated);
  border-radius: 12px;
}
.ai-fab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.ai-fab__icon { font-size: 20px; }

/* Pulse ring */
.ai-fab__pulse {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  border: 2px solid var(--color-primary);
  opacity: 0;
  animation: fab-pulse 2.5s ease-out infinite;
  pointer-events: none;
}
@keyframes fab-pulse {
  0%   { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0;   transform: scale(1.35); }
}

/* Unread badge */
.ai-fab__badge {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--color-success);
  border: 2px solid var(--bg-base);
}

/* Icon transition */
.fab-icon-enter-active,
.fab-icon-leave-active { transition: opacity 0.12s, transform 0.12s; }
.fab-icon-enter-from   { opacity: 0; transform: rotate(-45deg) scale(0.7); }
.fab-icon-leave-to     { opacity: 0; transform: rotate(45deg) scale(0.7); }

/* Mobile */
@media (max-width: 480px) {
  .ai-fab { bottom: 16px; right: 16px; }
}
</style>
