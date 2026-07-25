<template>
  <div
    class="ai-suggestions"
    role="list"
    aria-label="Suggested questions"
  >
    <p class="ai-suggestions__label">
      {{ label }}
    </p>
    <div class="ai-suggestions__chips">
      <button
        v-for="q in questions"
        :key="q"
        class="ai-suggestions__chip"
        role="listitem"
        @click="$emit('select', q)"
      >
        {{ q }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ questions: string[]; label?: string }>(),
  { label: 'Ask me about' },
)
defineEmits<{ select: [q: string] }>()
</script>

<style scoped>
.ai-suggestions { padding: 0 16px 4px; overflow: hidden; }

.ai-suggestions__label {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.ai-suggestions__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  overflow-x: hidden;
}

.ai-suggestions__chip {
  font-size: 12.5px;
  padding: 5px 11px;
  border-radius: 20px;
  border: 1px solid var(--border-default);
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  line-height: 1.4;
}
.ai-suggestions__chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-muted);
}
.ai-suggestions__chip:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
