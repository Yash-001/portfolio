// frontend/src/services/ai/index.ts
export { sendChat, streamChat } from './chat.service'
export type { ChatPayload, ChatResult, ConversationMessage, StreamChunk } from './chat.service'
export {
  trimHistory,
  buildContextHint,
  saveSession,
  loadSession,
  loadAllSessions,
  deleteSession,
  exportConversation,
  generateFollowUps,
} from './conversation.service'
export type { PersistedSession } from './conversation.service'
export { buildKnowledge, getKnowledge, invalidateKnowledge } from './knowledge'
export type { PortfolioKnowledge } from './knowledge'
