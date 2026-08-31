import type { BlogPostFull } from '@/types/content'
import { BLOG_AUTHOR } from '../author'

const post: BlogPostFull = {
  id:          'blog-7',
  slug:        'materialised-views-redis-caching',
  title:       'Dashboard in 8ms: Materialised Views + Redis Cache-Aside Pattern',
  excerpt:     "Our dashboard aggregation query took 2.8 seconds on the largest tenant. Here's the exact combination of PostgreSQL materialised views, Redis caching, and scheduled refresh that got it to 8ms with a 97% cache hit rate.",
  category:    'Performance',
  author:      BLOG_AUTHOR,
  tags:        [{ name: 'PostgreSQL', slug: 'postgresql' }, { name: 'Redis', slug: 'redis' }, { name: 'Performance', slug: 'performance' }],
  status:      'published',
  featured:    false,
  readingTime: 7,
  publishedAt: '2023-11-30',
  coverImage:  undefined,
  content: `
## The Query That Started This

The dashboard loaded fine during development. It loaded fine in staging. It loaded fine for the first few months in production.

Then one of our larger tenants crossed about 400,000 records and the dashboard started timing out. The main aggregation query — total assets, depreciation this period, upcoming renewals, spend by category — was taking 2.8 seconds. Users were refreshing and getting spinners.

The query itself wasn't badly written. It was doing real work: joining four tables, grouping by category, filtering by date ranges, computing running totals. The problem was that it ran on every page load, for every user, against live data that changed maybe a few times a day.

We were doing expensive computation repeatedly to serve data that barely changed.

---

## Why a Materialised View First, Not Just Redis

The instinct is to jump straight to Redis — cache the query result, done. The problem is that caching a slow query doesn't make the query fast. It makes it infrequent. When the cache misses (first load, after expiry, after invalidation), you're back to 2.8 seconds. For a dashboard that's the first thing users see after login, that's a bad experience.

The right fix is to make the underlying query fast, then cache the fast result.

A PostgreSQL materialised view pre-computes the aggregation and stores the result as a physical table. Querying it is a simple \`SELECT\` against a small, already-aggregated dataset — no joins, no grouping, no scanning 400k rows. That query takes under 20ms even without caching.

Redis then sits in front of it. Cache hit: 1–2ms. Cache miss: 20ms to query the materialised view and repopulate. Either way, the user gets a fast response.

---

## The Materialised View

\`\`\`sql
CREATE MATERIALISED VIEW dashboard_summary AS
SELECT
  a.tenant_id,
  a.category,
  COUNT(*)                                          AS total_assets,
  SUM(a.purchase_value)                             AS total_value,
  SUM(d.accumulated_depreciation)                   AS total_depreciation,
  COUNT(*) FILTER (WHERE a.renewal_date <= NOW() + INTERVAL '30 days'
                     AND a.renewal_date > NOW())    AS renewals_due_30d,
  SUM(a.purchase_value) FILTER (WHERE a.acquired_at >= DATE_TRUNC('year', NOW()))
                                                    AS spend_this_year
FROM assets a
LEFT JOIN depreciation_ledger d ON d.asset_id = a.id
  AND d.period = TO_CHAR(NOW(), 'YYYY-MM')
WHERE a.status = 'active'
GROUP BY a.tenant_id, a.category
WITH DATA;

CREATE UNIQUE INDEX ON dashboard_summary (tenant_id, category);
\`\`\`

The unique index on \`(tenant_id, category)\` serves two purposes: it makes point lookups fast, and it's required for \`REFRESH MATERIALISED VIEW CONCURRENTLY\` — which lets you refresh without locking reads.

---

## Refreshing Without Downtime

\`REFRESH MATERIALISED VIEW\` without \`CONCURRENTLY\` takes an exclusive lock. During the refresh, any query against the view blocks. For a dashboard that's always being loaded, that's unacceptable.

\`CONCURRENTLY\` refreshes in the background and swaps the data atomically. Reads continue uninterrupted. The tradeoff: it's slower and requires the unique index.

We refresh on a schedule via a Spring Boot \`@Scheduled\` job:

\`\`\`java
@Scheduled(fixedDelay = 300_000) // every 5 minutes
@Transactional
public void refreshDashboardSummary() {
  jdbcTemplate.execute("REFRESH MATERIALISED VIEW CONCURRENTLY dashboard_summary");
  log.info("dashboard_summary refreshed");
}
\`\`\`

5-minute refresh interval matches our business requirement: dashboard data doesn't need to be real-time, it needs to be recent. Assets aren't added or depreciated by the second.

---

## The Cache-Aside Pattern in Spring Boot

With the materialised view in place, the query is fast. Redis makes it near-instant for the common case.

Cache-aside means: check the cache first, return if hit, query the database on miss and populate the cache before returning.

\`\`\`java
@Service
public class DashboardService {

  private final JdbcTemplate jdbcTemplate;
  private final RedisTemplate<String, DashboardSummary> redisTemplate;

  private static final Duration CACHE_TTL = Duration.ofMinutes(6); // slightly longer than refresh interval

  public DashboardSummary getSummary(UUID tenantId) {
    String key = "dashboard:summary:" + tenantId;

    DashboardSummary cached = redisTemplate.opsForValue().get(key);
    if (cached != null) {
      return cached;
    }

    DashboardSummary summary = queryMaterialisedView(tenantId);
    redisTemplate.opsForValue().set(key, summary, CACHE_TTL);
    return summary;
  }

  private DashboardSummary queryMaterialisedView(UUID tenantId) {
    List<DashboardCategoryRow> rows = jdbcTemplate.query(
      """
      SELECT category, total_assets, total_value, total_depreciation,
             renewals_due_30d, spend_this_year
      FROM dashboard_summary
      WHERE tenant_id = ?
      """,
      (rs, rowNum) -> new DashboardCategoryRow(
        rs.getString("category"),
        rs.getLong("total_assets"),
        rs.getBigDecimal("total_value"),
        rs.getBigDecimal("total_depreciation"),
        rs.getInt("renewals_due_30d"),
        rs.getBigDecimal("spend_this_year")
      ),
      tenantId
    );
    return DashboardSummary.from(rows);
  }
}
\`\`\`

The TTL is 6 minutes — slightly longer than the 5-minute refresh interval. This means there's always a window where the cache holds data that's up to 6 minutes old, but the materialised view behind it is at most 5 minutes stale. Acceptable for this use case.

---

## Cache Invalidation on Significant Events

The scheduled refresh handles the normal case. But some events should invalidate the cache immediately — a bulk asset import, a manual depreciation run, a tenant data migration.

We publish a Spring application event from those operations and listen for it:

\`\`\`java
@Component
public class DashboardCacheInvalidator {

  private final RedisTemplate<String, DashboardSummary> redisTemplate;

  @EventListener
  public void onAssetBulkImport(AssetBulkImportCompletedEvent event) {
    String key = "dashboard:summary:" + event.getTenantId();
    redisTemplate.delete(key);
    // next request will miss cache, query materialised view, repopulate
  }
}
\`\`\`

We don't eagerly refresh the materialised view here — we just drop the cache key. The next request triggers a cache miss, queries the (possibly slightly stale) materialised view, and repopulates. The scheduled job will refresh the view within 5 minutes anyway.

---

## The Numbers

Before:
- Dashboard load time (p50): 2.8s
- Dashboard load time (p95): 4.1s
- Database CPU during peak load: 60–70%

After:
- Dashboard load time (p50): 8ms (cache hit)
- Dashboard load time (p95): 22ms (cache miss → materialised view query)
- Cache hit rate after one week: 97%
- Database CPU during peak load: 8–12%

The CPU drop was the more useful side effect than I expected. The dashboard aggregation was one of the heavier queries on the database and removing it from the hot path freed up headroom for other things.

---

## What to Watch Out For

**Stale data on first load after deployment.** If you restart the application, the Redis cache is empty. The first load for every tenant hits the materialised view. With many tenants, this can cause a brief spike in database load. We warm the cache on startup by pre-loading the most active tenants — otherwise the first load after a deployment hits the materialised view for every tenant simultaneously.

**The materialised view refresh itself takes time.** On our largest tenant, \`REFRESH MATERIALISED VIEW CONCURRENTLY\` takes about 800ms. During that window, reads still work (that's the point of \`CONCURRENTLY\`), but the refresh job holds a connection. Monitor refresh duration and alert if it starts approaching your refresh interval.

**Don't cache at the HTTP layer instead.** We briefly considered HTTP response caching with a short max-age. The problem: different users on the same tenant would get different cache keys, and cache invalidation on bulk import would require purging by pattern. Redis with explicit keys is simpler to reason about and invalidate.
`,
}

export default post
