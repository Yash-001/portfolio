import type { BlogPostFull } from '@/types/content'
import { BLOG_AUTHOR } from '../author'

const post: BlogPostFull = {
  id:          'blog-1',
  slug:        'postgresql-rls-multi-tenancy',
  title:       'PostgreSQL Row-Level Security: The Right Way to Build Multi-Tenant SaaS',
  excerpt:     "Most multi-tenant architectures use application-level tenant filtering. That's a bug waiting to happen. Here's how to push isolation down to the database layer with PostgreSQL RLS — and why it's safer, simpler, and faster.",
  category:    'Architecture',
  author:      BLOG_AUTHOR,
  tags:        [{ name: 'PostgreSQL', slug: 'postgresql' }, { name: 'Multi-Tenancy', slug: 'multi-tenancy' }, { name: 'SaaS', slug: 'saas' }],
  status:      'published',
  featured:    true,
  readingTime: 12,
  publishedAt: '2024-03-15',
  coverImage:  undefined,
  content: `
## The Problem With Application-Level Tenant Filtering

Every multi-tenant SaaS starts the same way. You add a \`tenant_id\` column to your tables, remember to add \`WHERE tenant_id = ?\` to every query, and ship it. It works — until it doesn't.

The failure modes are subtle and catastrophic:

- A developer forgets the \`WHERE\` clause on a new endpoint. Tenant A can now read Tenant B's data.
- A bulk update job runs without the filter. Every tenant's records get overwritten.
- A raw query in a migration script leaks cross-tenant data into a report.

Application-level filtering is a **convention**, not a constraint. Conventions break under pressure — deadlines, new team members, copy-pasted code. What you need is a **guarantee**.

PostgreSQL Row-Level Security gives you that guarantee at the database layer, where it cannot be bypassed by application code.

---

## What Is Row-Level Security?

RLS is a PostgreSQL feature that lets you attach security policies directly to tables. When enabled, every query against that table — \`SELECT\`, \`INSERT\`, \`UPDATE\`, \`DELETE\` — is automatically filtered by the policy. No application code required.

The database enforces isolation. Always. Even if your application code has a bug.

---

## Setting It Up: Step by Step

### 1. Enable RLS on Your Tables

\`\`\`sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
\`\`\`

\`FORCE ROW LEVEL SECURITY\` ensures the policy applies even to the table owner. Without it, superusers and table owners bypass RLS entirely — a footgun in production.

### 2. Create the Isolation Policy

\`\`\`sql
CREATE POLICY tenant_isolation ON invoices
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
\`\`\`

This policy says: *only return rows where \`tenant_id\` matches the current session's tenant context*. PostgreSQL appends this condition to every query automatically.

### 3. Set the Tenant Context Per Request

In your application, set the tenant context at the start of every database session:

\`\`\`java
// Spring Boot — set before any query in the request
jdbcTemplate.execute(
  "SET LOCAL app.current_tenant_id = '" + tenantId + "'"
);
\`\`\`

\`SET LOCAL\` scopes the setting to the current transaction. It resets automatically when the transaction ends — no risk of context leaking between requests in a connection pool.

### 4. Separate Policies for Write Operations

Read and write isolation are different concerns. Be explicit:

\`\`\`sql
-- SELECT policy
CREATE POLICY tenant_select ON invoices
  FOR SELECT
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- INSERT policy — enforce tenant_id on new rows
CREATE POLICY tenant_insert ON invoices
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- UPDATE policy
CREATE POLICY tenant_update ON invoices
  FOR UPDATE
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- DELETE policy
CREATE POLICY tenant_delete ON invoices
  FOR DELETE
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
\`\`\`

---

## The Performance Question

The first concern everyone raises: *doesn't this add overhead to every query?*

In practice, no — if you index correctly.

\`\`\`sql
CREATE INDEX idx_invoices_tenant_id ON invoices (tenant_id);
\`\`\`

PostgreSQL's query planner treats the RLS predicate like any other \`WHERE\` clause. With the index in place, the planner uses an index scan filtered by \`tenant_id\` before touching any other rows. The overhead in practice was negligible — we didn't see any meaningful latency increase on tables with several million rows.

The key insight: **RLS doesn't add a second pass over the data**. It rewrites the query before execution. The planner sees \`WHERE tenant_id = $1 AND <your conditions>\` and optimises accordingly.

---

## Handling Admin and Service Accounts

Some operations legitimately need cross-tenant access — analytics jobs, support tooling, data migrations. You have two clean options:

**Option 1: Bypass RLS with a dedicated role**

\`\`\`sql
CREATE ROLE service_admin BYPASSRLS;
GRANT service_admin TO your_migration_user;
\`\`\`

Use this role only for trusted internal tooling. Never expose it to application code paths reachable by end users.

**Option 2: Explicit policy exception**

\`\`\`sql
CREATE POLICY tenant_isolation ON invoices
  USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
    OR current_setting('app.is_admin', true)::boolean = true
  );
\`\`\`

Set \`app.is_admin = true\` only in controlled admin contexts. The \`true\` second argument to \`current_setting\` prevents an error if the variable isn't set — it returns \`NULL\` instead, which evaluates to \`false\` in the \`OR\` condition.

---

## Testing Your Policies

Never ship RLS policies without testing them explicitly. Here's a minimal test pattern:

\`\`\`sql
-- Seed two tenants
INSERT INTO tenants (id, name) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Tenant A'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Tenant B');

INSERT INTO invoices (id, tenant_id, amount) VALUES
  ('inv-1', 'aaaaaaaa-0000-0000-0000-000000000001', 1000),
  ('inv-2', 'bbbbbbbb-0000-0000-0000-000000000002', 2000);

-- Set context to Tenant A
SET LOCAL app.current_tenant_id = 'aaaaaaaa-0000-0000-0000-000000000001';

-- Should return exactly 1 row (inv-1 only)
SELECT COUNT(*) FROM invoices;
-- Expected: 1

-- Attempt to read Tenant B's invoice directly
SELECT * FROM invoices WHERE id = 'inv-2';
-- Expected: 0 rows (not an error — just invisible)
\`\`\`

The last point is important: RLS doesn't throw an error on cross-tenant access attempts. It silently returns zero rows. This is intentional — it prevents tenant enumeration attacks. An attacker can't distinguish "this record doesn't exist" from "this record exists but you can't see it."

---

## What We Learned in Production

A few things that came up after running this in production:

**1. Connection pooling needs care.** PgBouncer in transaction mode works perfectly — \`SET LOCAL\` resets with the transaction. Session mode requires explicit reset logic. We use transaction mode exclusively.

**2. Migrations need a bypass role.** Schema migrations that backfill \`tenant_id\` or restructure data need to run as \`BYPASSRLS\`. Build this into your migration tooling from day one.

**3. Audit logging becomes trivial.** Because \`app.current_tenant_id\` is always set in the session, you can add a trigger that logs it automatically on every write. Cross-tenant audit trails with zero application code.

**4. The mental model shift is worth it.** Once developers know RLS is enforced at the DB layer, they stop second-guessing every query. The cognitive load of "did I remember the tenant filter?" disappears entirely.

---

## The Bottom Line

Application-level tenant filtering is a convention that will eventually be violated. PostgreSQL RLS is a constraint that cannot be. For any SaaS handling sensitive data across multiple tenants, the migration cost is worth it — and it's lower than you think.

The pattern is: enable RLS, create policies, set context per transaction, index \`tenant_id\`, and give your migration tooling a bypass role. That's it. Your application code gets simpler, your security posture gets stronger, and the cognitive overhead of "did I remember the tenant filter?" on every new endpoint just goes away.
`,
}

export default post
