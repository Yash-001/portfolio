export default {
  label:   'About',
  heading: "I don't just write code.",
  headingAccent: 'I engineer outcomes.',
  story: [
    "Seven years ago I joined a fintech startup as the only backend engineer. No playbook, no senior to ask — just a production system that needed to handle real money for real people without falling over. That pressure taught me something no course ever could: the difference between code that works in a demo and code that works at 3 AM when the on-call phone rings.",
    "Since then I've built and shipped enterprise systems across banking, logistics, and SaaS — things like a payment reconciliation engine processing ₹40 Cr daily, a multi-tenant Spring Boot platform serving 12 enterprise clients, and a CI/CD pipeline that cut deployment time from 4 hours to 18 minutes. The stack changes. The discipline doesn't.",
    "My approach is boring in the best way: understand the domain first, model it correctly, then pick the simplest technology that survives production. I've seen too many projects collapse under clever abstractions that nobody could debug at midnight. I'd rather write code my future self can read than code that impresses in a code review.",
    "Lately I've been integrating AI tooling — not as a gimmick, but as a force multiplier. LLM-assisted code generation, intelligent search over internal knowledge bases, automated anomaly detection in data pipelines. The goal is always the same: ship more value with less friction, and make the system easier to reason about, not harder.",
  ],
  signatureTitle: 'Enterprise Software & AI Consultant · {years}+ yrs',
  philosophy: {
    systems: {
      title: 'Systems over features',
      body:  'A feature ships once. The system it lives in runs forever. I design for operability first — observability, failure modes, and rollback before the first line of business logic.',
    },
    boring: {
      title: 'Boring is a compliment',
      body:  'Postgres, Spring Boot, Redis, S3. Proven tools with known failure modes beat novel ones with unknown edges. I reach for new tech when the problem genuinely demands it.',
    },
    domain: {
      title: 'Domain before architecture',
      body:  "The biggest source of complexity in enterprise software isn't the tech — it's a misunderstood domain. I spend time with stakeholders before I open an IDE.",
    },
    ai: {
      title: 'AI as a multiplier',
      body:  "I use LLMs to accelerate the parts of engineering that don't require judgment — boilerplate, test generation, documentation. The judgment stays human.",
    },
  },
  respondsIn: 'Responds in {time}',
  timeline: {
    2017: {
      role:    'Junior Backend Engineer',
      company: 'Fintech Startup',
      desc:    'First production system. Learned that uptime is a feature and that nobody reads the runbook until 2 AM.',
    },
    2019: {
      role:    'Software Engineer',
      company: 'Enterprise SaaS',
      desc:    'Migrated a monolith to modular services. Reduced p99 latency by 60% through query optimization and caching strategy.',
    },
    2021: {
      role:    'Senior Engineer',
      company: 'Logistics Platform',
      desc:    'Designed a real-time tracking pipeline on Kafka + AWS. Owned architecture decisions end-to-end for the first time.',
    },
    2023: {
      role:    'Lead Engineer / Consultant',
      company: 'Independent',
      desc:    'Working directly with founders and CTOs. Shipping full-stack systems, cloud infrastructure, and AI-integrated backends.',
    },
  },
} as const
