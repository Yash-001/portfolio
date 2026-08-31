import type { BlogPostFull } from '@/types/content'
import { BLOG_AUTHOR } from '../author'

const post: BlogPostFull = {
  id:          'blog-2',
  slug:        'spring-batch-idempotency',
  title:       'Making Spring Batch Jobs Idempotent: Lessons from a Production Incident',
  excerpt:     "Our depreciation batch created duplicate journal entries when it retried after a transient DB failure. Here's the exact pattern we used to make it idempotent — and why batch_run_id is the key.",
  category:    'Backend',
  author:      BLOG_AUTHOR,
  tags:        [{ name: 'Spring Batch', slug: 'spring-batch' }, { name: 'Java', slug: 'java' }, { name: 'Idempotency', slug: 'idempotency' }],
  status:      'published',
  featured:    false,
  readingTime: 8,
  publishedAt: '2024-02-28',
  coverImage:  undefined,
  content: `
## The Incident

It was a Monday morning. Our finance team opened their dashboard and found duplicate depreciation entries for every fixed asset — a few thousand duplicate journal entries created overnight.

What happened: the batch job ran, processed about 60% of assets, hit a transient connection timeout on the database write, and Spring Batch retried the entire step from the beginning. The first 60% got written twice.

The job had been running fine for months. One network blip exposed the fact that it was never actually idempotent — we'd just been lucky.

---

## Why Batch Jobs Are Naturally Non-Idempotent

A typical Spring Batch step looks like this:

\`\`\`java
@Bean
public Step depreciationStep() {
  return stepBuilderFactory.get("depreciationStep")
    .<Asset, JournalEntry>chunk(100)
    .reader(assetItemReader())
    .processor(depreciationProcessor())
    .writer(journalEntryWriter())
    .build();
}
\`\`\`

The writer just inserts. If the step retries, it inserts again. There's no check for "did I already write this?"

Spring Batch tracks job execution state in its metadata tables (\`BATCH_JOB_EXECUTION\`, \`BATCH_STEP_EXECUTION\`), but that only tells you whether a step *completed* — not whether individual items were already written. A step that failed halfway through will restart from the beginning of the chunk, not from where it left off.

---

## The Fix: batch_run_id as an Idempotency Key

The core idea is simple: every write operation carries a \`batch_run_id\` that ties it to a specific job execution. Before inserting, check if a record with that \`batch_run_id\` already exists. If it does, skip it.

### Step 1: Add batch_run_id to Your Output Table

\`\`\`sql
ALTER TABLE journal_entries
  ADD COLUMN batch_run_id VARCHAR(64),
  ADD CONSTRAINT uq_journal_batch UNIQUE (asset_id, fiscal_period, batch_run_id);
\`\`\`

The unique constraint does the heavy lifting. Even if your application logic has a bug, the database will reject the duplicate.

### Step 2: Pass the Job Execution ID Through the Pipeline

\`\`\`java
@Bean
public Step depreciationStep(JobExecution jobExecution) {
  String batchRunId = String.valueOf(jobExecution.getId());

  return stepBuilderFactory.get("depreciationStep")
    .<Asset, JournalEntry>chunk(100)
    .reader(assetItemReader())
    .processor(new DepreciationProcessor(batchRunId))
    .writer(journalEntryWriter())
    .build();
}
\`\`\`

\`\`\`java
public class DepreciationProcessor implements ItemProcessor<Asset, JournalEntry> {
  private final String batchRunId;

  public DepreciationProcessor(String batchRunId) {
    this.batchRunId = batchRunId;
  }

  @Override
  public JournalEntry process(Asset asset) {
    JournalEntry entry = calculateDepreciation(asset);
    entry.setBatchRunId(batchRunId);
    return entry;
  }
}
\`\`\`

### Step 3: Use INSERT ... ON CONFLICT DO NOTHING

\`\`\`java
@Override
public void write(List<? extends JournalEntry> entries) {
  jdbcTemplate.batchUpdate(
    """
    INSERT INTO journal_entries (asset_id, fiscal_period, amount, batch_run_id)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (asset_id, fiscal_period, batch_run_id) DO NOTHING
    """,
    entries,
    entries.size(),
    (ps, entry) -> {
      ps.setString(1, entry.getAssetId());
      ps.setString(2, entry.getFiscalPeriod());
      ps.setBigDecimal(3, entry.getAmount());
      ps.setString(4, entry.getBatchRunId());
    }
  );
}
\`\`\`

\`ON CONFLICT DO NOTHING\` means retries are safe. The second run silently skips rows that already exist. No duplicates, no errors.

---

## Handling Restarts vs. Re-runs

There's an important distinction here:

- **Restart**: the same \`JobInstance\` retrying after a failure. Spring Batch assigns the same \`JobExecution\` ID. Your \`batch_run_id\` is the same, so the unique constraint protects you.
- **Re-run**: a new \`JobInstance\` for the same business period (e.g., running depreciation for March twice by mistake). Spring Batch assigns a new \`JobExecution\` ID, so \`batch_run_id\` is different — the unique constraint won't catch this.

For re-runs, you need a separate guard at the job level:

\`\`\`java
@Bean
public Job depreciationJob() {
  return jobBuilderFactory.get("depreciationJob")
    .incrementer(new RunIdIncrementer())
    .validator(new FiscalPeriodValidator()) // rejects if period already completed
    .start(depreciationStep())
    .build();
}
\`\`\`

\`\`\`java
public class FiscalPeriodValidator implements JobParametersValidator {
  @Override
  public void validate(JobParameters parameters) throws JobParametersInvalidException {
    String period = parameters.getString("fiscalPeriod");
    if (journalEntryRepository.existsByFiscalPeriodAndStatus(period, "COMPLETED")) {
      throw new JobParametersInvalidException(
        "Depreciation for period " + period + " already completed"
      );
    }
  }
}
\`\`\`

This is a business-level guard, not a technical one. It prevents accidental re-runs from reaching the database at all.

---

## Skip Logic Without Losing Idempotency

Sometimes you want to skip failed items and continue, not abort the whole step. Spring Batch's skip policy handles this — but you need to be careful it doesn't interact badly with your idempotency logic.

\`\`\`java
return stepBuilderFactory.get("depreciationStep")
  .<Asset, JournalEntry>chunk(100)
  .reader(assetItemReader())
  .processor(depreciationProcessor())
  .writer(journalEntryWriter())
  .faultTolerant()
  .skipLimit(10)
  .skip(DataIntegrityViolationException.class) // skip actual data problems
  .noSkip(DeadlockLoserDataAccessException.class) // retry deadlocks, don't skip
  .build();
\`\`\`

The key: skip \`DataIntegrityViolationException\` only for genuine data issues (malformed asset records), not for your idempotency constraint violations. Since you're using \`ON CONFLICT DO NOTHING\`, the constraint never throws — so this isn't a problem in practice.

---

## What We Changed After the Incident

Beyond the idempotency fix, we made three process changes:

**1. Added a post-step reconciliation check.** After the step completes, a listener counts expected vs. actual journal entries and fails the job if they don't match. Catches silent data issues that \`ON CONFLICT DO NOTHING\` might mask.

\`\`\`java
public class ReconciliationListener implements StepExecutionListener {
  @Override
  public ExitStatus afterStep(StepExecution stepExecution) {
    long expected = stepExecution.getReadCount();
    long written  = journalEntryRepository.countByBatchRunId(
      stepExecution.getJobExecution().getId().toString()
    );
    if (written != expected) {
      return new ExitStatus("FAILED", "Expected " + expected + " entries, wrote " + written);
    }
    return ExitStatus.COMPLETED;
  }
}
\`\`\`

**2. Made the unique constraint cover the business key, not just the batch key.** \`(asset_id, fiscal_period)\` should be unique regardless of \`batch_run_id\`. We added a partial unique index for completed entries:

\`\`\`sql
CREATE UNIQUE INDEX uq_journal_completed
  ON journal_entries (asset_id, fiscal_period)
  WHERE status = 'COMPLETED';
\`\`\`

**3. Added alerting on retry count.** If a step retries more than twice, we get paged. Retries are normal; repeated retries mean something is structurally wrong.

---

## The Pattern in One Sentence

Every batch write should carry a \`batch_run_id\`, the output table should have a unique constraint on \`(business_key, batch_run_id)\`, and the insert should use \`ON CONFLICT DO NOTHING\`.

That's it. The rest — validators, reconciliation listeners, skip policies — is defence in depth. But the core pattern is three things: a run ID, a constraint, and a conflict-safe insert.

The incident cost us most of the day cleaning up the data manually and explaining to the finance team why the numbers were wrong. The fix itself wasn't complicated once we understood the problem.
`,
}

export default post
