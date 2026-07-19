export const EAM_PROJECT = {
  title:   'Enterprise Asset Management System',
  tagline: 'Managing ₹200Cr+ in physical assets across 14 enterprise clients.',
  description:
    'A full-stack EAM platform built from scratch — Spring Boot 3 microservices backend, Vue 3 frontend, PostgreSQL with row-level security, deployed on AWS ECS with zero-downtime blue/green deployments. Handles the complete asset lifecycle: procurement, commissioning, maintenance scheduling, depreciation, audits, and disposal.',
  role:     'Lead Architect & Full-Stack Engineer',
  duration: '14 months',
  year:     2023,
  status:   'Production',
  clients:  14,
} as const

export const EAM_METRICS = [
  { value: '₹200Cr+', label: 'Assets under management',  description: 'Total asset value tracked across all clients' },
  { value: '14',      label: 'Enterprise clients',        description: 'Live production tenants on shared infrastructure' },
  { value: '99.94%',  label: 'Uptime SLA',                description: 'Measured over 12 months in production' },
  { value: '2.1s',    label: 'Avg page load',             description: 'P95 across all dashboard views' },
  { value: '40K+',    label: 'Assets tracked',            description: 'Physical assets across all client accounts' },
  { value: '0',       label: 'Data breaches',             description: 'Zero cross-tenant data leakage incidents' },
] as const

export const EAM_TECH = [
  { name: 'Java 21',        color: '#f89820', category: 'Backend'  },
  { name: 'Spring Boot 3',  color: '#6db33f', category: 'Backend'  },
  { name: 'Spring Security',color: '#6db33f', category: 'Backend'  },
  { name: 'Spring Batch',   color: '#6db33f', category: 'Backend'  },
  { name: 'Vue 3',          color: '#42b883', category: 'Frontend' },
  { name: 'TypeScript',     color: '#3178c6', category: 'Frontend' },
  { name: 'Pinia',          color: '#ffd859', category: 'Frontend' },
  { name: 'PostgreSQL 15',  color: '#336791', category: 'Database' },
  { name: 'Redis 7',        color: '#dc382d', category: 'Database' },
  { name: 'AWS ECS',        color: '#ff9900', category: 'Cloud'    },
  { name: 'AWS RDS',        color: '#ff9900', category: 'Cloud'    },
  { name: 'AWS S3',         color: '#ff9900', category: 'Cloud'    },
  { name: 'AWS CloudFront', color: '#ff9900', category: 'Cloud'    },
  { name: 'Docker',         color: '#2496ed', category: 'DevOps'   },
  { name: 'Jenkins',        color: '#d33833', category: 'DevOps'   },
  { name: 'Terraform',      color: '#7b42bc', category: 'DevOps'   },
  { name: 'Liquibase',      color: '#2962ff', category: 'Database' },
] as const

export const EAM_TECH_CATEGORIES = ['Backend', 'Frontend', 'Database', 'Cloud', 'DevOps'] as const

export const EAM_FEATURES = [
  {
    icon: 'pi pi-box',
    title: 'Asset Lifecycle Management',
    description: 'Full lifecycle from procurement request through commissioning, active use, maintenance, and disposal. Every state transition is audited with actor, timestamp, and reason.',
    color: '#6366f1',
  },
  {
    icon: 'pi pi-wrench',
    title: 'Predictive Maintenance Scheduling',
    description: 'Rule-based maintenance scheduler with configurable intervals per asset category. Spring Batch jobs generate work orders 30 days ahead. Overdue alerts via email and in-app notifications.',
    color: '#10b981',
  },
  {
    icon: 'pi pi-chart-line',
    title: 'Depreciation Engine',
    description: 'Configurable depreciation methods (straight-line, declining balance, units of production) per asset class. Monthly batch runs calculate book value and generate journal entries for ERP integration.',
    color: '#f59e0b',
  },
  {
    icon: 'pi pi-shield',
    title: 'Multi-Tenant Isolation',
    description: 'PostgreSQL row-level security enforces tenant boundaries at the database layer. No application-level tenant filtering. Verified under concurrent load with 14 simultaneous tenants.',
    color: '#ef4444',
  },
  {
    icon: 'pi pi-file-export',
    title: 'Audit & Compliance Reports',
    description: 'Scheduled and on-demand reports: asset register, depreciation schedule, maintenance history, disposal log. PDF generation via JasperReports. Exportable to Excel for statutory filings.',
    color: '#8b5cf6',
  },
  {
    icon: 'pi pi-qrcode',
    title: 'QR Code Asset Tagging',
    description: 'Every asset gets a unique QR code on commissioning. Mobile-friendly scan-to-view shows full asset history, current status, next maintenance date, and assigned custodian.',
    color: '#06b6d4',
  },
] as const

export const EAM_CHALLENGES = [
  {
    title: 'Cross-tenant query performance at scale',
    problem: "With RLS enabled, PostgreSQL's query planner couldn't use partition pruning effectively. Queries that should scan one tenant's 3,000 assets were scanning all 40,000+ rows before RLS filtered them.",
    solution: 'Added a tenant_id column to every table and created composite indexes (tenant_id, primary_key). Combined with RLS, the planner now prunes correctly. Query time dropped from 340ms to 18ms on the asset list endpoint.',
    impact: '94% query time reduction on the most-hit endpoint.',
    color: '#6366f1',
  },
  {
    title: 'Depreciation batch correctness under retries',
    problem: "Spring Batch's retry mechanism was re-running depreciation calculations on transient DB failures, creating duplicate journal entries. The batch was not idempotent.",
    solution: 'Introduced a batch_run_id (UUID) generated once per scheduled run. Each journal entry stores the batch_run_id. Before writing, the step checks for existing entries with that ID. Retries become no-ops.',
    impact: 'Zero duplicate journal entries across 14 months of production runs.',
    color: '#10b981',
  },
  {
    title: 'Real-time dashboard with 40K+ assets',
    problem: 'The dashboard aggregation query (asset counts by status, category, location) was taking 2.8s on the largest tenant with 8,000 assets. Unacceptable for a page that loads on every login.',
    solution: 'Materialised view refreshed every 5 minutes via a scheduled job. Redis caches the last-known result with a 5-minute TTL. Dashboard loads from cache in <10ms. A "last updated" timestamp tells users when data was last refreshed.',
    impact: 'Dashboard load: 2.8s → 8ms. Cache hit rate: 97%.',
    color: '#f59e0b',
  },
  {
    title: 'Zero-downtime schema migrations with live tenants',
    problem: '14 live tenants meant no maintenance windows. A schema migration that locks a table for 30 seconds would cause visible downtime for all clients simultaneously.',
    solution: 'Adopted the expand-contract migration pattern via Liquibase. New columns are added nullable first (expand), application code handles both old and new schema, then a background job backfills data, then the old column is dropped (contract). No table locks held during data migration.',
    impact: 'Zero downtime across 23 schema migrations in production.',
    color: '#ef4444',
  },
] as const

export const EAM_ENGINEERING_DECISIONS = [
  {
    decision: 'Shared-schema multi-tenancy over separate schemas',
    rationale: 'Separate schemas would require 14× the connection pool size, 14× the migration runs, and 14× the monitoring surface. Shared schema with RLS gives the same isolation guarantee at 1× operational cost.',
    tradeoff: 'RLS adds ~3% query overhead. Accepted — the operational simplicity is worth it.',
    color: '#6366f1',
  },
  {
    decision: 'Spring Batch over custom scheduler for depreciation',
    rationale: "Spring Batch's chunk-oriented processing, built-in retry, skip, and restart-from-checkpoint semantics are exactly what this workload needs. A custom scheduler would reinvent all of that.",
    tradeoff: 'Spring Batch has a steep learning curve and verbose config. Mitigated by using the Java DSL exclusively.',
    color: '#10b981',
  },
  {
    decision: 'Liquibase over Flyway for migrations',
    rationale: "Liquibase's XML changelog format supports rollback scripts natively. With 14 live tenants, the ability to roll back a bad migration without manual SQL is non-negotiable.",
    tradeoff: "XML is more verbose than Flyway's SQL files. Acceptable for the rollback capability.",
    color: '#f59e0b',
  },
  {
    decision: 'Materialised views over real-time aggregation',
    rationale: "Dashboard aggregations are read 100× more often than assets are updated. Paying the aggregation cost on every read is wasteful. A 5-minute staleness window is acceptable for a dashboard — it's not a trading system.",
    tradeoff: 'Data is up to 5 minutes stale. Communicated clearly in the UI with a "last updated" timestamp.',
    color: '#8b5cf6',
  },
] as const

export const EAM_API = {
  overview: 'RESTful API following RFC 7807 for error responses. All endpoints versioned under /api/v1/. JWT authentication via Spring Security with per-tenant claims. Rate limiting via Redis token bucket (100 req/min per tenant).',
  endpoints: [
    { method: 'GET',   path: '/api/v1/assets',                   description: 'Paginated asset list with filters (status, category, location, custodian)' },
    { method: 'POST',  path: '/api/v1/assets',                   description: 'Create asset — triggers QR code generation and audit log entry' },
    { method: 'PATCH', path: '/api/v1/assets/:id/status',        description: 'Lifecycle transition with validation against allowed state machine transitions' },
    { method: 'GET',   path: '/api/v1/assets/:id/history',       description: 'Full audit trail — every field change with actor, timestamp, before/after values' },
    { method: 'POST',  path: '/api/v1/maintenance/work-orders',  description: 'Create work order — validates asset status, assigns technician, sends notification' },
    { method: 'GET',   path: '/api/v1/reports/depreciation',     description: 'Depreciation schedule — supports date range, asset class, export format (PDF/XLSX)' },
    { method: 'POST',  path: '/api/v1/tenants/:id/provision',    description: 'Admin-only — provisions new tenant in <4 min' },
    { method: 'GET',   path: '/api/v1/dashboard/summary',        description: 'Aggregated dashboard metrics — served from materialised view cache, <10ms' },
  ],
  auth: 'JWT (RS256). Access token: 15min TTL. Refresh token: 7 days, stored HttpOnly cookie. Token rotation on every refresh. Revocation via Redis blocklist.',
  rateLimit: 'Redis token bucket. 100 req/min per tenant. 429 response includes Retry-After header. Burst allowance: 20 req/s.',
} as const

export const EAM_DATABASE = {
  overview: 'PostgreSQL 15. Shared schema, per-tenant RLS. 31 tables. Liquibase migrations. Read replicas for reporting queries.',
  tables: [
    { name: 'assets',               description: 'Core asset record — 42 columns covering all lifecycle fields, depreciation config, location, custodian' },
    { name: 'asset_history',        description: 'Append-only audit log — every field change stored as JSON diff with actor_id, changed_at, change_reason' },
    { name: 'maintenance_schedules',description: 'Configurable maintenance rules per asset category — interval, type, estimated duration, required skills' },
    { name: 'work_orders',          description: 'Generated maintenance tasks — status machine (open → assigned → in-progress → completed/cancelled)' },
    { name: 'depreciation_runs',    description: 'Batch run metadata — run_id, period, status, record count, error count, started_at, completed_at' },
    { name: 'journal_entries',      description: 'Depreciation journal — debit/credit accounts, amount, asset_id, batch_run_id (idempotency key)' },
    { name: 'tenants',              description: 'Tenant registry — config JSON, feature flags, subscription tier, provisioned_at' },
  ],
  indexStrategy: 'Composite indexes on (tenant_id, primary_key) for all RLS-filtered tables. Partial indexes on assets WHERE status = \'active\' for dashboard queries. GIN index on asset_history.change_data JSONB for audit search.',
  rls: "SET app.current_tenant = :tenantId in Spring Security filter. All tables have ENABLE ROW LEVEL SECURITY. Policy: USING (tenant_id = current_setting('app.current_tenant')::uuid).",
} as const

export const EAM_SECURITY = [
  { title: 'Row-Level Security',      description: "PostgreSQL RLS enforces tenant isolation at the DB layer. Application code cannot bypass it — even a SQL injection would be scoped to the attacker's tenant.", icon: 'pi pi-lock',      color: '#6366f1' },
  { title: 'JWT with RS256',          description: 'Asymmetric signing — private key never leaves the auth service. Public key distributed to all services for local verification. No network hop on every request.', icon: 'pi pi-key',       color: '#10b981' },
  { title: 'OWASP Top 10 Hardening', description: 'Spring Security CSRF protection, Content-Security-Policy headers, HSTS, X-Frame-Options. SQL injection impossible via JPA parameterised queries. XSS prevented by Vue template escaping.', icon: 'pi pi-shield',    color: '#f59e0b' },
  { title: 'Secrets Management',      description: 'All credentials in AWS Secrets Manager. Zero secrets in environment variables, config files, or source code. Rotation handled by AWS — application fetches on startup.', icon: 'pi pi-eye-slash', color: '#ef4444' },
  { title: 'Audit Logging',           description: 'Every data mutation logged to asset_history with actor_id, IP, user agent, before/after values. Logs are append-only — no UPDATE or DELETE on the audit table. Retained 7 years.', icon: 'pi pi-list',      color: '#8b5cf6' },
  { title: 'Rate Limiting',           description: 'Redis token bucket per tenant. Prevents one tenant from starving others on shared infrastructure. Separate limits for read (100/min) and write (20/min) operations.', icon: 'pi pi-sliders-h', color: '#06b6d4' },
] as const

export const EAM_SCALABILITY = [
  { metric: 'Horizontal scaling', detail: 'Stateless Spring Boot containers behind AWS ALB. ECS auto-scaling on CPU >70%. Scaled from 2 to 8 containers during month-end batch peak without manual intervention.' },
  { metric: 'Connection pooling', detail: 'HikariCP with pool size = (2 × CPU cores) + 1 per container. RDS Proxy in front of PostgreSQL absorbs connection spikes from ECS scaling events.' },
  { metric: 'Read replicas',      detail: "Reporting queries (depreciation schedules, audit exports) routed to RDS read replica via Spring's @Transactional(readOnly=true). Removes reporting load from primary." },
  { metric: 'Cache strategy',     detail: 'Redis for: session data (15min TTL), dashboard aggregations (5min TTL), rate limit counters (sliding window), QR code lookups (24hr TTL). Cache-aside pattern throughout.' },
  { metric: 'Async processing',   detail: "Report generation, email notifications, and QR code generation are async via Spring's @Async with a bounded thread pool. API returns 202 Accepted immediately." },
] as const

export const EAM_PERFORMANCE = [
  { endpoint: 'GET /assets (list)',         p50: '45ms',  p95: '120ms', p99: '210ms', notes: 'Composite index on (tenant_id, status, category)' },
  { endpoint: 'GET /dashboard/summary',    p50: '8ms',   p95: '12ms',  p99: '18ms',  notes: 'Served from Redis materialised view cache' },
  { endpoint: 'GET /assets/:id/history',   p50: '32ms',  p95: '88ms',  p99: '145ms', notes: 'GIN index on JSONB change_data column' },
  { endpoint: 'POST /assets (create)',      p50: '95ms',  p95: '180ms', p99: '290ms', notes: 'Includes QR generation (async) and audit log write' },
  { endpoint: 'GET /reports/depreciation', p50: '1.2s',  p95: '2.8s',  p99: '4.1s',  notes: 'Read replica + PDF generation — acceptable for reports' },
  { endpoint: 'Depreciation batch (full)', p50: '38min', p95: '45min', p99: '52min', notes: 'All 40K+ assets across 14 tenants, parallel chunks' },
] as const

export const EAM_DEPLOYMENT = {
  strategy: 'Blue/green deployment via AWS ECS. New task definition deployed to green environment. ALB listener rule switched atomically. Rollback in <90 seconds by switching listener back.',
  pipeline: [
    { step: 'Code push',      detail: 'Developer pushes to main branch' },
    { step: 'Jenkins CI',     detail: 'Maven build → unit tests → integration tests → SonarQube analysis' },
    { step: 'Docker build',   detail: 'Multi-stage Dockerfile — builder stage (JDK 21) → runtime stage (JRE 21-slim). Image: ~180MB' },
    { step: 'ECR push',       detail: 'Tagged with git SHA and semantic version. Immutable tags enforced' },
    { step: 'Terraform plan', detail: 'Infrastructure diff reviewed in PR. Applied automatically on merge to main' },
    { step: 'ECS deploy',     detail: 'New task definition registered. ECS rolling update with min 50% healthy, max 200% capacity' },
    { step: 'Health check',   detail: 'ALB health check on /actuator/health. 3 consecutive 200s required before traffic shift' },
    { step: 'Smoke tests',    detail: 'Automated Postman collection runs against production after deploy. Rollback triggered on failure' },
  ],
  infrastructure: 'Terraform-managed. VPC with public/private subnets. ECS Fargate (no EC2 management). RDS Multi-AZ PostgreSQL. ElastiCache Redis cluster. CloudFront CDN for static assets. Route 53 for DNS.',
} as const

export const EAM_ROADMAP = [
  { phase: 'Q1 2024', status: 'completed',   title: 'Multi-Tenant RLS',          description: 'PostgreSQL row-level security. Onboarded 14 enterprise clients on shared infrastructure.' },
  { phase: 'Q2 2024', status: 'completed',   title: 'Depreciation Engine',        description: 'Spring Batch depreciation with idempotent journal entries. Processing ₹200Cr+ monthly.' },
  { phase: 'Q3 2024', status: 'completed',   title: 'QR Asset Tagging',           description: 'QR code generation and mobile-friendly scan-to-view. Deployed across 3 client sites.' },
  { phase: 'Q4 2024', status: 'in-progress', title: 'Advanced Reporting',         description: 'JasperReports integration. Scheduled PDF delivery. Excel export for statutory filings.' },
  { phase: 'Q1 2025', status: 'planned',     title: 'Mobile App',                 description: 'React Native app for field technicians. QR scan, work order updates, photo attachments. Offline-first with sync on reconnect.' },
  { phase: 'Q2 2025', status: 'planned',     title: 'IoT Sensor Integration',     description: 'MQTT broker for real-time sensor data from connected assets. Anomaly detection triggers automatic work orders.' },
  { phase: 'Q3 2025', status: 'planned',     title: 'Predictive Maintenance AI',  description: 'ML model trained on maintenance history to predict failure probability. Surfaces high-risk assets in dashboard before they fail.' },
  { phase: 'Q4 2025', status: 'planned',     title: 'ERP Integration Hub',        description: 'Pre-built connectors for SAP, Oracle Financials, and Tally. Bi-directional sync for asset register and journal entries.' },
] as const

export const EAM_TIMELINE = [
  { month: 'Month 1–2',   title: 'Architecture & Foundation',  description: 'System design, DB schema, multi-tenancy model, CI/CD pipeline, Terraform infrastructure. First tenant provisioned in staging.' },
  { month: 'Month 3–4',   title: 'Core Asset CRUD',            description: 'Asset lifecycle state machine, audit logging, QR code generation, basic dashboard. Internal alpha with first client.' },
  { month: 'Month 5–6',   title: 'Maintenance Module',         description: 'Maintenance scheduling engine, work order management, technician assignment, email notifications. Beta with 3 clients.' },
  { month: 'Month 7–8',   title: 'Depreciation Engine',        description: 'Spring Batch depreciation runs, journal entry generation, ERP export format. Idempotency hardening after first production incident.' },
  { month: 'Month 9–10',  title: 'Reporting & Compliance',     description: 'JasperReports integration, scheduled report delivery, audit export, statutory compliance reports. 8 clients live.' },
  { month: 'Month 11–12', title: 'Performance & Scale',        description: 'Materialised views, Redis caching, read replica routing, connection pool tuning. Load tested to 20 tenants.' },
  { month: 'Month 13–14', title: 'GA & Client Onboarding',     description: 'General availability. Onboarded remaining 6 clients. 14 tenants live. SLA monitoring, runbook documentation.' },
] as const

export const EAM_SCREENSHOTS = [
  { id: 'dashboard',    label: 'Asset Dashboard',       description: 'Real-time overview of all assets by status, category, and location. Served from Redis cache in <10ms.' },
  { id: 'asset-list',   label: 'Asset Registry',        description: 'Paginated, filterable asset list with inline status badges, custodian, and next maintenance date.' },
  { id: 'maintenance',  label: 'Maintenance Scheduler', description: 'Work order queue with priority, assigned technician, and estimated completion. Overdue items highlighted.' },
  { id: 'depreciation', label: 'Depreciation Report',   description: 'Monthly depreciation schedule with book value, accumulated depreciation, and journal entry preview.' },
  { id: 'audit-trail',  label: 'Audit Trail',           description: 'Append-only change log with actor, timestamp, and field-level diff for every asset mutation.' },
  { id: 'mobile-qr',    label: 'QR Scan View',          description: 'Mobile-optimised asset detail view triggered by QR scan. Full history, status, and next maintenance.' },
] as const

export const EAM_TABS = [
  { id: 'overview',     label: 'Overview',     icon: 'pi pi-home'         },
  { id: 'architecture', label: 'Architecture', icon: 'pi pi-sitemap'      },
  { id: 'features',     label: 'Features',     icon: 'pi pi-star'         },
  { id: 'challenges',   label: 'Challenges',   icon: 'pi pi-bolt'         },
  { id: 'api',          label: 'API Design',   icon: 'pi pi-code'         },
  { id: 'database',     label: 'Database',     icon: 'pi pi-database'     },
  { id: 'security',     label: 'Security',     icon: 'pi pi-shield'       },
  { id: 'performance',  label: 'Performance',  icon: 'pi pi-chart-bar'    },
  { id: 'deployment',   label: 'Deployment',   icon: 'pi pi-cloud-upload' },
  { id: 'roadmap',      label: 'Roadmap',      icon: 'pi pi-map'          },
] as const

export type EamTabId = typeof EAM_TABS[number]['id']
