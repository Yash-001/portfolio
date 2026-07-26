<template>
  <div
    class="ai-msg"
    :class="[`ai-msg--${message.role}`, `ai-msg--${message.status}`]"
    :aria-label="message.role === 'user' ? 'Your message' : 'Assistant reply'"
  >
    <!-- Avatar -->
    <div
      class="ai-msg__avatar"
      aria-hidden="true"
    >
      <span
        v-if="message.role === 'user'"
        class="ai-msg__avatar-icon"
      >
        <i class="pi pi-user" />
      </span>
      <span
        v-else
        class="ai-msg__avatar-icon ai-msg__avatar-icon--ai"
      >
        <i class="pi pi-microchip-ai" />
      </span>
    </div>

    <!-- Bubble -->
    <div class="ai-msg__bubble">
      <!-- Streaming skeleton -->
      <div
        v-if="message.status === 'streaming' && !message.content"
        class="ai-msg__typing"
        aria-label="Assistant is typing"
      >
        <span /><span /><span />
      </div>

      <!-- Content — sanitized before render -->
      <div
        v-else-if="message.content"
        class="ai-msg__content prose"
        v-html="rendered"
      />

      <!-- Error state -->
      <div
        v-if="message.status === 'error'"
        class="ai-msg__error"
        role="alert"
      >
        <i
          class="pi pi-exclamation-triangle"
          aria-hidden="true"
        />
        <span>{{ message.error || 'Something went wrong.' }}</span>
      </div>

      <!-- Streaming cursor -->
      <span
        v-if="message.status === 'streaming' && message.content"
        class="ai-msg__cursor"
        aria-hidden="true"
      />

      <!-- Timestamp -->
      <time
        v-if="message.status === 'done'"
        class="ai-msg__time"
        :datetime="message.timestamp.toISOString()"
      >{{ timeLabel }}</time>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { marked, Renderer } from 'marked'
import DOMPurify from 'dompurify'
import type { ChatMessageItem } from '@/stores/chat.store'

const props = defineProps<{ message: ChatMessageItem }>()

// ── Lazy-load highlight.js once per app lifetime ──────────────────────────────
type HljsModule = typeof import('highlight.js').default

// Module-level cache — shared across all AiChatMessage instances
let _hljs: HljsModule | null = null
let _hljsPromise: Promise<HljsModule> | null = null

function loadHljs(): Promise<HljsModule> {
  if (_hljs) return Promise.resolve(_hljs)
  if (_hljsPromise) return _hljsPromise
  _hljsPromise = Promise.all([
    import('highlight.js'),
    import('highlight.js/styles/github-dark.css'),
  ]).then(([{ default: hljs }]) => {
    _hljs = hljs
    return hljs
  })
  return _hljsPromise
}

const hljsReady = ref(false)

onMounted(() => {
  loadHljs().then(() => { hljsReady.value = true })
})

// ── marked renderer — configured once at module level ────────────────────────
const _renderer = new Renderer()

_renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  if (!_hljs) return `<pre class="ai-code-block"><code>${text}</code></pre>`
  const language = lang && _hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = _hljs.highlight(text, { language }).value
  return `<pre class="ai-code-block"><code class="hljs language-${language}">${highlighted}</code></pre>`
}

_renderer.codespan = ({ text }: { text: string }) =>
  `<code class="ai-inline-code">${text}</code>`

_renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
  const safeHref = href?.startsWith('javascript:') ? '#' : (href ?? '#')
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${safeHref}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
}

// Guard against marked.use() being called multiple times on HMR
let _markedConfigured = false
if (!_markedConfigured) {
  marked.use({ renderer: _renderer, breaks: true, gfm: true })
  _markedConfigured = true
}

// DOMPurify config
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'span', 'div',
  ] as string[],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class', 'aria-label'] as string[],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: false,
}

// Re-compute rendered content when hljs becomes ready (re-renders code blocks with highlighting)
const rendered = computed(() => {
  void hljsReady.value // reactive dependency — re-runs when hljs loads
  if (!props.message.content) return ''
  const raw = marked.parse(props.message.content) as string
  return DOMPurify.sanitize(raw, PURIFY_CONFIG)
})

const timeLabel = computed(() => {
  const d = props.message.timestamp
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})
</script>

<style scoped>
.ai-msg {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  animation: msg-in 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}

@keyframes msg-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ai-msg--user { flex-direction: row-reverse; }

/* Avatar */
.ai-msg__avatar { flex-shrink: 0; }
.ai-msg__avatar-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  background: var(--bg-overlay);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}
.ai-msg__avatar-icon--ai {
  background: var(--color-primary-muted);
  color: var(--color-primary);
  border-color: rgba(99,102,241,0.25);
}

/* Bubble */
.ai-msg__bubble {
  max-width: min(80%, 520px);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-msg--user .ai-msg__bubble { align-items: flex-end; }

/* Content */
.ai-msg__content {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  word-break: break-word;
}

.ai-msg--user .ai-msg__content {
  background: var(--color-primary-muted);
  border-color: rgba(99,102,241,0.2);
  border-bottom-right-radius: 4px;
}

.ai-msg--assistant .ai-msg__content {
  border-bottom-left-radius: 4px;
}

/* Prose resets inside bubble */
.ai-msg__content :deep(p)          { margin: 0 0 8px; }
.ai-msg__content :deep(p:last-child) { margin-bottom: 0; }
.ai-msg__content :deep(ul),
.ai-msg__content :deep(ol)         { margin: 6px 0; padding-left: 20px; }
.ai-msg__content :deep(li)         { margin: 3px 0; }
.ai-msg__content :deep(strong)     { color: var(--text-primary); font-weight: 600; }
.ai-msg__content :deep(a)          { color: var(--color-primary); text-decoration: underline; }
.ai-msg__content :deep(h1),
.ai-msg__content :deep(h2),
.ai-msg__content :deep(h3)         { font-size: 14px; font-weight: 600; margin: 10px 0 4px; color: var(--text-primary); }
.ai-msg__content :deep(blockquote) {
  border-left: 3px solid var(--color-primary);
  padding-left: 12px;
  margin: 8px 0;
  color: var(--text-secondary);
}
.ai-msg__content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 8px 0;
}
.ai-msg__content :deep(th),
.ai-msg__content :deep(td) {
  padding: 6px 10px;
  border: 1px solid var(--border-default);
  text-align: left;
}
.ai-msg__content :deep(th) {
  background: var(--bg-overlay);
  font-weight: 600;
}

/* Code blocks */
.ai-msg__content :deep(.ai-code-block) {
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 12px 14px;
  overflow-x: auto;
  margin: 8px 0;
  font-size: 12.5px;
  line-height: 1.6;
}
.ai-msg__content :deep(.ai-inline-code) {
  background: var(--bg-overlay);
  border: 1px solid var(--border-default);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 12.5px;
  font-family: 'Geist Mono', monospace;
  color: var(--color-primary);
}

/* Typing indicator */
.ai-msg__typing {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  border-bottom-left-radius: 4px;
}
.ai-msg__typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-tertiary);
  animation: typing-dot 1.2s ease-in-out infinite;
}
.ai-msg__typing span:nth-child(2) { animation-delay: 0.2s; }
.ai-msg__typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30%            { transform: translateY(-5px); opacity: 1; }
}

/* Streaming cursor */
.ai-msg__cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background: var(--color-primary);
  border-radius: 1px;
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 0.8s step-end infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

/* Error */
.ai-msg__error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-error);
  padding: 6px 10px;
  background: var(--color-error-bg);
  border: 1px solid rgba(248,113,113,0.2);
  border-radius: 8px;
}

/* Timestamp */
.ai-msg__time {
  font-size: 11px;
  color: var(--text-tertiary);
  padding: 0 4px;
}
</style>
