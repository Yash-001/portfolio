// ─────────────────────────────────────────────────────────────────────────────
// src/content/faq/index.ts
// Single source of truth for all FAQ entries.
// To add a question: add one object to FAQ_ITEMS. Nothing else.
// ─────────────────────────────────────────────────────────────────────────────

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: 'availability' | 'process' | 'technical' | 'pricing' | 'general'
  order: number
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'availability',
    question: 'Are you currently available for new projects?',
    answer: 'Yes — I am currently available for new engagements. I typically take on 1–2 projects at a time to ensure full focus. If your timeline is flexible, reach out early to reserve a slot.',
    category: 'availability',
    order: 1,
  },
  {
    id: 'remote-work',
    question: 'Do you work remotely?',
    answer: 'Yes, fully remote. I am based in India (UTC+5:30) and have worked with clients across Europe, the US, and Southeast Asia. I schedule overlap hours to match your team\'s working day.',
    category: 'availability',
    order: 2,
  },
  {
    id: 'engagement-types',
    question: 'What engagement models do you offer?',
    answer: 'Fixed-price projects for well-scoped work, hourly for audits and reviews, retainer for ongoing support, and consulting for architecture and advisory. Most greenfield builds are fixed-price after a scoping call.',
    category: 'pricing',
    order: 3,
  },
  {
    id: 'project-duration',
    question: 'How long does a typical project take?',
    answer: 'A backend API takes 2–8 weeks. A full-stack product build is 4–16 weeks. Enterprise multi-tenant platforms run 8–24 weeks. Duration depends on scope, not padding — I scope honestly before committing.',
    category: 'process',
    order: 4,
  },
  {
    id: 'tech-stack',
    question: 'What is your primary tech stack?',
    answer: 'Backend: Java 21 + Spring Boot 3. Frontend: Vue 3 + TypeScript. Database: PostgreSQL. Cloud: AWS (ECS, RDS, Lambda). CI/CD: Jenkins + Docker. I also work with Kafka, Redis, and OpenAI API for AI-assisted systems.',
    category: 'technical',
    order: 5,
  },
  {
    id: 'existing-codebase',
    question: 'Can you work on an existing codebase?',
    answer: 'Yes. I regularly join projects mid-flight — rescuing systems that have outgrown their original design, adding features to legacy codebases, or improving performance. I always start with a codebase audit before touching anything.',
    category: 'process',
    order: 6,
  },
  {
    id: 'nda-ip',
    question: 'Do you sign NDAs and assign IP?',
    answer: 'Yes to both. All client work is covered by a mutual NDA and full IP assignment. You own everything built during the engagement. I retain no rights to your code, data, or business logic.',
    category: 'process',
    order: 7,
  },
  {
    id: 'communication',
    question: 'How do you communicate during a project?',
    answer: 'Async-first via Slack or email for daily updates. Weekly video calls for progress reviews. I write clear status updates so you always know where things stand — no chasing required.',
    category: 'process',
    order: 8,
  },
  {
    id: 'ai-experience',
    question: 'What AI/LLM experience do you have?',
    answer: 'I have built production LLM pipelines using OpenAI function calling + Spring Batch, reducing manual document review by 70%. I work with GPT-4o, embeddings, pgvector semantic search, and confidence-scored human review queues.',
    category: 'technical',
    order: 9,
  },
  {
    id: 'start-project',
    question: 'How do I start a project with you?',
    answer: 'Send an email or book a 30-minute call via Calendly. We discuss your requirements, I ask clarifying questions, and within 48 hours I send a written scope, timeline, and fixed price. No obligation until you sign.',
    category: 'general',
    order: 10,
  },
]
