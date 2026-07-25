# ai-service/app/knowledge/portfolio.py
# Python-native portfolio knowledge.
# Mirrors src/content/* from the frontend — edit here when content changes.
# Structured so the prompt builder can access every section independently.

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ContactInfo:
    name: str
    title: str
    email: str
    phone: str
    location: str
    timezone: str
    response_time: str
    availability: str
    site_url: str
    resume_url: str
    calendly_url: str
    github: str
    linkedin: str


@dataclass(frozen=True)
class CareerEntry:
    role: str
    company: str
    period: str
    current: bool
    highlights: list[str]
    technologies: list[str]


@dataclass(frozen=True)
class Project:
    title: str
    tagline: str
    description: str
    category: str
    year: int
    role: str
    outcome: str
    technologies: list[str]
    metrics: list[str]   # "label: value — description"


@dataclass(frozen=True)
class SkillEntry:
    name: str
    category: str
    level: str
    years: int
    context: str


@dataclass(frozen=True)
class Service:
    title: str
    tagline: str
    description: str
    deliverables: list[str]
    engagement: str
    duration: str


@dataclass(frozen=True)
class FaqEntry:
    question: str
    answer: str


@dataclass(frozen=True)
class PortfolioKnowledge:
    contact: ContactInfo
    bio: str
    tagline: str
    years_of_experience: int
    career: list[CareerEntry]
    projects: list[Project]
    skills: list[SkillEntry]
    services: list[Service]
    faq: list[FaqEntry]


# ── Data ──────────────────────────────────────────────────────────────────────

PORTFOLIO_KNOWLEDGE = PortfolioKnowledge(
    contact=ContactInfo(
        name="Yash Ranjan",
        title="Enterprise Software & AI Consultant",
        email="yash.ranjan.dev@gmail.com",
        phone="+91-7779964211",
        location="India (UTC+5:30)",
        timezone="UTC+5:30",
        response_time="24 hours",
        availability="Available for new projects",
        site_url="https://yourdomain.com",
        resume_url="/resume.pdf",
        calendly_url="https://calendly.com/placeholder",
        github="https://github.com/Yash-001",
        linkedin="https://www.linkedin.com/in/yash-ranjan-a0197b166/",
    ),
    bio="Building production-grade systems for startups and enterprises. Available for remote engagements worldwide.",
    tagline="I build production-ready full-stack applications enhanced with AI.",
    years_of_experience=7,
    career=[
        CareerEntry(
            role="Lead Engineer & Technical Consultant",
            company="Independent / Freelance",
            period="Jan 2023 – Present",
            current=True,
            highlights=[
                "Architected a multi-tenant SaaS backend in Spring Boot 3 serving 8 enterprise clients from a single deployment with PostgreSQL row-level security",
                "Built an LLM-assisted document processing pipeline using OpenAI function calling + Spring Batch, reducing manual review time by 70%",
                "Migrated a legacy Oracle monolith to Spring Boot + PostgreSQL — zero downtime, phased over 6 months",
                "Designed CI/CD pipelines on Jenkins + AWS ECS cutting deployment time from 4 hours to 18 minutes",
                "Delivered Vue 3 frontends with PrimeVue for 3 clients including a real-time dashboard handling 500+ concurrent users",
            ],
            technologies=["Java 21", "Spring Boot 3", "Vue 3", "PostgreSQL", "AWS ECS", "Docker", "Jenkins", "OpenAI API", "TypeScript"],
        ),
        CareerEntry(
            role="Enterprise Software & AI Consultant",
            company="Logistics & Supply Chain Platform",
            period="Mar 2021 – Dec 2022",
            current=False,
            highlights=[
                "Designed a real-time shipment tracking pipeline on Apache Kafka + Spring Boot processing 50K+ events/day with sub-200ms p99 latency",
                "Introduced event sourcing for the order lifecycle enabling full audit trails and replay capability",
                "Reduced PostgreSQL query times by 65% through execution plan analysis, composite indexing, and materialized views",
                "Led migration from manual deployments to Kubernetes on AWS EKS — reduced infrastructure cost by 30%",
                "Mentored 3 junior engineers and established ADR practice adopted across the team",
            ],
            technologies=["Java 11", "Spring Boot", "Apache Kafka", "PostgreSQL", "Kubernetes", "AWS EKS", "Docker", "Redis"],
        ),
        CareerEntry(
            role="Software Engineer",
            company="Enterprise SaaS — HR & Payroll",
            period="Jun 2019 – Feb 2021",
            current=False,
            highlights=[
                "Built a configurable payroll calculation engine handling 40+ statutory compliance rules across 6 Indian states",
                "Designed multi-tenant data architecture supporting 12 enterprise clients, reducing onboarding from 3 weeks to 4 days",
                "Optimised a critical month-end batch job from 6 hours to 45 minutes using Spring Batch parallel processing",
                "Integrated with EPFO, ESIC, TDS APIs via a resilient adapter with retry and circuit breaker",
            ],
            technologies=["Java 8", "Spring Boot", "Oracle DB", "Spring Batch", "Maven", "Jenkins", "Redis"],
        ),
        CareerEntry(
            role="Junior Backend Engineer",
            company="Fintech Startup — Payments",
            period="Jul 2017 – May 2019",
            current=False,
            highlights=[
                "Built the transaction reconciliation engine from scratch matching 100K+ daily payment records across 3 gateways with 99.97% accuracy",
                "Implemented idempotency keys and distributed locking eliminating duplicate charge incidents",
                "Wrote the first automated test suite for the payments module — 340 unit and integration tests",
                "Reduced API response time from 1.2s to 180ms by fixing N+1 queries and introducing Redis caching",
            ],
            technologies=["Java 8", "Spring MVC", "PostgreSQL", "Redis", "Maven", "JUnit"],
        ),
    ],
    projects=[
        Project(
            title="Multi-Tenant SaaS Platform",
            tagline="One deployment. Eight enterprise clients. Zero data leakage.",
            description="Spring Boot 3 backend serving 8 enterprise clients from a single deployment with per-tenant data isolation via PostgreSQL row-level security.",
            category="Enterprise",
            year=2024,
            role="Lead Architect & Engineer",
            outcome="Reduced infrastructure cost by 65%. Deployment time dropped from 4 hours to 18 minutes. New client onboarding: 4 minutes.",
            technologies=["Java 21", "Spring Boot 3", "PostgreSQL", "Vue 3", "AWS ECS", "Docker", "Jenkins", "Redis"],
            metrics=["Cost reduction: 65%", "Deploy time: 18min (from 4 hours)", "Enterprise clients: 8", "Onboarding: 4min"],
        ),
        Project(
            title="LLM Document Processing Pipeline",
            tagline="GPT-4o + Spring Batch. 70% less manual review.",
            description="AI-assisted pipeline ingesting unstructured legal and financial documents, extracting structured data using OpenAI function calling, validated against business rules.",
            category="Backend / AI",
            year=2024,
            role="Backend Engineer & AI Integration Lead",
            outcome="Manual review time dropped by 70%. Processes 500+ documents/day with 94% straight-through rate. Token cost reduced 60% via chunking optimisation.",
            technologies=["Java 21", "Spring Batch", "OpenAI API", "PostgreSQL", "pgvector", "Apache Tika", "Docker", "AWS Lambda"],
            metrics=["Manual review reduction: 70%", "Daily throughput: 500+ documents", "Straight-through rate: 94%", "Token cost reduction: 60%"],
        ),
        Project(
            title="Real-Time Logistics Tracking",
            tagline="50,000 shipment events per day. Sub-200ms p99.",
            description="Kafka-backed event streaming platform for real-time shipment tracking across 200+ vehicles with event sourcing for full audit trails.",
            category="Backend",
            year=2022,
            role="Senior Backend Engineer — Architecture Owner",
            outcome="Location staleness dropped from 30–90s to under 3s. Database load reduced by 85%. p99 API latency: 180ms.",
            technologies=["Java 11", "Apache Kafka", "Spring Boot", "PostgreSQL", "Redis", "Kubernetes", "AWS EKS"],
            metrics=["Location staleness: <3s (from 30–90s)", "DB load reduction: 85%", "Daily events: 50K+", "p99 latency: 180ms"],
        ),
        Project(
            title="Payroll Compliance Engine",
            tagline="₹40 Cr/month. 40+ statutory rules. Zero miscalculations.",
            description="Configurable payroll calculation engine handling Indian statutory compliance across 6 states for 12 enterprise clients.",
            category="Enterprise",
            year=2020,
            role="Software Engineer — Backend Lead",
            outcome="Zero payroll errors since deployment. Batch processing: 45 minutes (from 6 hours). Processes ₹40 Cr+ monthly.",
            technologies=["Java 8", "Spring Boot", "Spring Batch", "Oracle DB", "Redis", "Jenkins"],
            metrics=["Monthly transactions: ₹40Cr", "Batch processing: 45min (from 6 hours)", "Compliance rules: 40+", "Onboarding: 4 days"],
        ),
        Project(
            title="Payment Reconciliation Engine",
            tagline="100K records/day. 99.97% accuracy.",
            description="Transaction reconciliation system matching 100,000+ daily payment records across 3 payment gateways with idempotency and distributed locking.",
            category="Backend / Fintech",
            year=2018,
            role="Junior Backend Engineer — Sole Owner",
            outcome="99.97% reconciliation accuracy. Zero duplicate charges since deployment. Daily reconciliation: 8 minutes (from 3 hours manual).",
            technologies=["Java 8", "Spring MVC", "PostgreSQL", "Redis", "JUnit"],
            metrics=["Daily records: 100K+", "Accuracy: 99.97%", "Time saved: 3hrs/day", "Duplicate charges: 0"],
        ),
    ],
    skills=[
        SkillEntry("Java 21", "backend", "expert", 7, "Primary language across every enterprise system shipped. Virtual threads, records, sealed classes."),
        SkillEntry("Spring Boot", "backend", "expert", 6, "Spring Security, Data JPA, WebFlux, Batch. Multi-tenant platforms and high-throughput APIs."),
        SkillEntry("Vue 3", "frontend", "expert", 3, "Composition API, Pinia, Vue Router. This portfolio is built on it."),
        SkillEntry("TypeScript", "frontend", "advanced", 4, "Strict mode, generics, utility types. No any in production."),
        SkillEntry("PostgreSQL", "database", "advanced", 4, "Query optimisation, indexing, partitioning, JSONB, window functions, RLS."),
        SkillEntry("Apache Kafka", "backend", "advanced", 3, "Event streaming, partitioning strategies, consumer groups, exactly-once semantics."),
        SkillEntry("AWS", "cloud", "intermediate", 3, "EC2, ECS Fargate, EKS, Lambda, RDS, S3, CloudFront, SQS, SNS, IAM, VPC."),
        SkillEntry("Docker", "devops", "advanced", 4, "Multi-stage builds, compose, image optimisation."),
        SkillEntry("Kubernetes", "devops", "intermediate", 2, "Deployments, services, ingress, HPA, EKS on AWS."),
        SkillEntry("Redis", "backend", "advanced", 4, "Caching, distributed locking, pub/sub, rate limiting."),
        SkillEntry("OpenAI API", "ai", "intermediate", 2, "GPT-4o, embeddings, function calling, RAG pipelines, token optimisation."),
        SkillEntry("Spring Batch", "backend", "advanced", 4, "Parallel chunk processing, job restartability, large-scale ETL pipelines."),
        SkillEntry("Angular", "frontend", "advanced", 3, "Components, RxJS, Angular Material, Reactive Forms."),
        SkillEntry("Terraform", "cloud", "intermediate", 2, "IaC for AWS resources — ECS, RDS, ElastiCache, CloudFront."),
        SkillEntry("Domain-Driven Design", "architecture", "advanced", 4, "Bounded contexts, aggregates, domain events, ubiquitous language."),
        SkillEntry("Multi-Tenancy", "architecture", "advanced", 3, "Shared-schema with RLS, schema-per-tenant, data isolation patterns."),
    ],
    services=[
        Service(
            title="Full Stack Development",
            tagline="End-to-end product delivery — from DB schema to deployed UI.",
            description="Spring Boot APIs, Vue 3 frontend, PostgreSQL schema, AWS infrastructure, and CI/CD pipeline. One engineer across the entire stack.",
            deliverables=["Spring Boot 3 + Vue 3 application", "PostgreSQL schema with migrations", "AWS ECS/Fargate deployment", "Jenkins CI/CD pipeline", "Technical documentation"],
            engagement="Fixed Price",
            duration="4–16 weeks",
        ),
        Service(
            title="Backend API Development",
            tagline="Production-grade REST APIs built for scale and correctness.",
            description="Spring Boot 3 APIs with RFC 7807 error handling, JWT auth, rate limiting, pagination, and OpenAPI docs.",
            deliverables=["RESTful API with OpenAPI 3 spec", "JWT authentication & authorisation", "Redis caching & rate limiting", "Integration test suite (>80% coverage)", "Postman collection"],
            engagement="Fixed Price",
            duration="2–8 weeks",
        ),
        Service(
            title="Enterprise Software",
            tagline="Multi-tenant SaaS and internal tools for enterprise clients.",
            description="Multi-tenant platforms with PostgreSQL RLS, Spring Batch for bulk processing, and blue/green deployments.",
            deliverables=["Multi-tenant architecture with RLS", "Role-based access control (RBAC)", "Audit logging & compliance reports", "Spring Batch bulk processing", "Zero-downtime deployment strategy"],
            engagement="Fixed Price",
            duration="8–24 weeks",
        ),
        Service(
            title="AI Integrations",
            tagline="LLM pipelines that solve real business problems, not demos.",
            description="OpenAI function calling, Spring Batch document pipelines, pgvector semantic search, confidence-scored human review queues.",
            deliverables=["OpenAI / Anthropic API integration", "Document processing pipeline", "pgvector semantic search", "Human-in-the-loop review queue", "Token cost optimisation"],
            engagement="Fixed Price",
            duration="3–10 weeks",
        ),
        Service(
            title="Technical Consulting",
            tagline="Architecture decisions made with someone who has shipped them.",
            description="Technology selection, system design reviews, team mentoring, and pre-launch technical audits.",
            deliverables=["Architecture design session", "Technology selection guidance", "System design document review", "Team technical mentoring", "Pre-launch audit & sign-off"],
            engagement="Consulting",
            duration="Ongoing",
        ),
    ],
    faq=[
        FaqEntry("Are you currently available for new projects?", "Yes — currently available for new engagements. I take on 1–2 projects at a time to ensure full focus."),
        FaqEntry("Do you work remotely?", "Yes, fully remote. Based in India (UTC+5:30), working with clients across Europe, the US, and Southeast Asia."),
        FaqEntry("What engagement models do you offer?", "Fixed-price projects for well-scoped work, hourly for audits and reviews, retainer for ongoing support, and consulting for architecture advisory."),
        FaqEntry("How long does a typical project take?", "Backend API: 2–8 weeks. Full-stack product: 4–16 weeks. Enterprise multi-tenant platform: 8–24 weeks."),
        FaqEntry("What is your primary tech stack?", "Backend: Java 21 + Spring Boot 3. Frontend: Vue 3 + TypeScript. Database: PostgreSQL. Cloud: AWS. CI/CD: Jenkins + Docker."),
        FaqEntry("Can you work on an existing codebase?", "Yes. I regularly join projects mid-flight — rescuing systems, adding features to legacy codebases, or improving performance."),
        FaqEntry("Do you sign NDAs and assign IP?", "Yes to both. All client work is covered by a mutual NDA and full IP assignment. You own everything built."),
        FaqEntry("What AI/LLM experience do you have?", "Production LLM pipelines using OpenAI function calling + Spring Batch, reducing manual document review by 70%. GPT-4o, embeddings, pgvector, confidence-scored review queues."),
        FaqEntry("How do I start a project?", "Send an email or book a 30-minute call via Calendly. Within 48 hours I send a written scope, timeline, and fixed price."),
    ],
)
