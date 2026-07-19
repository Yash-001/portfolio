import type { Experience } from '@/types'

export const EXPERIENCES: Experience[] = [
  {
    id: 'lead-consultant',
    role: 'Lead Engineer & Technical Consultant',
    company: 'Independent / Freelance',
    companyUrl: '',
    location: 'Remote — India',
    type: 'freelance',
    startDate: '2023-01',
    endDate: 'present',
    current: true,
    description:
      'Working directly with founders and CTOs to architect and ship full-stack systems. Scope ranges from greenfield product builds to rescuing systems that have outgrown their original design. Every engagement starts with understanding the business before touching the codebase.',
    highlights: [
      { text: 'Architected a multi-tenant SaaS backend in Spring Boot 3 serving 8 enterprise clients from a single deployment, with per-tenant data isolation via PostgreSQL row-level security' },
      { text: 'Built an LLM-assisted document processing pipeline using OpenAI function calling + Spring Batch, reducing manual review time by 70%' },
      { text: 'Migrated a legacy Oracle monolith to a modular Spring Boot + PostgreSQL architecture — zero downtime, phased over 6 months' },
      { text: 'Designed and implemented CI/CD pipelines on Jenkins + AWS ECS that cut average deployment time from 4 hours to 18 minutes' },
      { text: 'Delivered Vue 3 frontends with PrimeVue for 3 clients, including a real-time operations dashboard handling 500+ concurrent users' },
    ],
    tech: [
      { name: 'Java 21' }, { name: 'Spring Boot 3' }, { name: 'Vue 3' },
      { name: 'PostgreSQL' }, { name: 'AWS ECS' }, { name: 'Docker' },
      { name: 'Jenkins' }, { name: 'OpenAI API' }, { name: 'TypeScript' },
    ],
    order: 1,
  },
  {
    id: 'senior-engineer-logistics',
    role: 'Senior Software Engineer',
    company: 'Logistics & Supply Chain Platform',
    companyUrl: '',
    location: 'Pune, India',
    type: 'full-time',
    startDate: '2021-03',
    endDate: '2022-12',
    current: false,
    description:
      'Joined as the first senior backend hire on a platform processing 50,000+ shipment events per day. Owned architecture decisions end-to-end for the first time — from data model to deployment topology. The system needed to be right because failures meant trucks sitting idle.',
    highlights: [
      { text: 'Designed a real-time shipment tracking pipeline on Apache Kafka + Spring Boot, processing 50K+ events/day with sub-200ms p99 latency' },
      { text: 'Introduced event sourcing for the order lifecycle, enabling full audit trails and replay capability that unblocked a major enterprise client contract' },
      { text: 'Reduced PostgreSQL query times by 65% across the reporting module through execution plan analysis, composite indexing, and materialized views' },
      { text: 'Led migration from manual deployments to Kubernetes on AWS EKS — reduced infrastructure cost by 30% through right-sizing and autoscaling' },
      { text: 'Mentored 3 junior engineers; established code review standards and ADR (Architecture Decision Record) practice adopted across the team' },
    ],
    tech: [
      { name: 'Java 11' }, { name: 'Spring Boot' }, { name: 'Apache Kafka' },
      { name: 'PostgreSQL' }, { name: 'Kubernetes' }, { name: 'AWS EKS' },
      { name: 'Docker' }, { name: 'Redis' }, { name: 'Gradle' },
    ],
    order: 2,
  },
  {
    id: 'software-engineer-saas',
    role: 'Software Engineer',
    company: 'Enterprise SaaS — HR & Payroll',
    companyUrl: '',
    location: 'Mumbai, India',
    type: 'full-time',
    startDate: '2019-06',
    endDate: '2021-02',
    current: false,
    description:
      'Worked on a payroll platform processing ₹40 Cr in transactions monthly across 12 enterprise clients. The domain was unforgiving — a wrong calculation meant someone got paid incorrectly. Learned to treat correctness as a non-negotiable constraint, not a nice-to-have.',
    highlights: [
      { text: 'Built a configurable payroll calculation engine in Java that handled 40+ statutory compliance rules across 6 Indian states, replacing a brittle Excel-based process' },
      { text: 'Designed the multi-tenant data architecture supporting 12 enterprise clients with strict data isolation, reducing onboarding time from 3 weeks to 4 days' },
      { text: 'Optimised a critical month-end batch job from 6 hours to 45 minutes using Spring Batch parallel processing and Oracle query tuning' },
      { text: 'Integrated with 4 third-party payroll APIs (EPFO, ESIC, TDS) — built a resilient adapter layer with retry, circuit breaker, and reconciliation' },
      { text: 'Introduced contract testing with Pact, catching 3 breaking API changes before they reached production' },
    ],
    tech: [
      { name: 'Java 8' }, { name: 'Spring Boot' }, { name: 'Oracle DB' },
      { name: 'Spring Batch' }, { name: 'Maven' }, { name: 'Jenkins' },
      { name: 'REST APIs' }, { name: 'Redis' }, { name: 'Angular' },
    ],
    order: 3,
  },
  {
    id: 'junior-engineer-fintech',
    role: 'Junior Backend Engineer',
    company: 'Fintech Startup — Payments',
    companyUrl: '',
    location: 'Bangalore, India',
    type: 'full-time',
    startDate: '2017-07',
    endDate: '2019-05',
    current: false,
    description:
      'First job. Joined a 12-person payments startup as the only backend engineer on the reconciliation team. No playbook, no senior to ask — just a production system handling real money and a mandate to keep it running. The pressure was the education.',
    highlights: [
      { text: 'Built the transaction reconciliation engine from scratch — matching 100K+ daily payment records across 3 payment gateways with 99.97% accuracy' },
      { text: 'Implemented idempotency keys and distributed locking for payment processing, eliminating duplicate charge incidents that had cost the company ₹2L in refunds' },
      { text: 'Wrote the first automated test suite for the payments module — 340 unit and integration tests, catching a critical rounding bug before a major client launch' },
      { text: 'Reduced API response time from 1.2s to 180ms average by profiling, fixing N+1 queries, and introducing a Redis caching layer' },
    ],
    tech: [
      { name: 'Java 8' }, { name: 'Spring MVC' }, { name: 'PostgreSQL' },
      { name: 'Redis' }, { name: 'Maven' }, { name: 'REST APIs' },
      { name: 'JUnit' }, { name: 'Git' },
    ],
    order: 4,
  },
]

export const EXPERIENCE_TYPE_CONFIG = {
  'full-time':  { label: 'Full-time',  color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
  'contract':   { label: 'Contract',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  'freelance':  { label: 'Freelance',  color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
  'part-time':  { label: 'Part-time',  color: '#22d3ee', bg: 'rgba(34,211,238,0.1)'  },
} as const
