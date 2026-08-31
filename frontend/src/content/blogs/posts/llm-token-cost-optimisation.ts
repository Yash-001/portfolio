import type { BlogPostFull } from '@/types/content'
import { BLOG_AUTHOR } from '../author'

const post: BlogPostFull = {
  id:          'blog-3',
  slug:        'llm-token-cost-optimisation',
  title:       'Cutting GPT-4o Token Costs by 60% Without Losing Accuracy',
  excerpt:     "Token cost is the main engineering constraint in LLM integrations. Here's the chunking strategy, prompt compression techniques, and confidence scoring approach that reduced our per-document cost by 60% in production.",
  category:    'AI & ML',
  author:      BLOG_AUTHOR,
  tags:        [{ name: 'OpenAI', slug: 'openai' }, { name: 'LLM', slug: 'llm' }, { name: 'Cost Optimisation', slug: 'cost-optimisation' }],
  status:      'published',
  featured:    false,
  readingTime: 10,
  publishedAt: '2024-02-10',
  coverImage:  undefined,
  content: `
## The Problem

We were processing insurance documents — policy PDFs, claim forms, endorsements — through GPT-4o to extract structured data. The accuracy was excellent. The bill was not.

At peak load, we were spending around $0.18 per document. The volume wasn't enormous but it was growing, and the cost per document made the unit economics uncomfortable at scale.

The constraint wasn't accuracy — GPT-4o was doing the job well. The constraint was token volume. We were sending too much text, too often, to the most expensive model in the chain.

After a couple of weeks of profiling and iterating, we got to $0.072 per document — a 60% reduction — with no measurable drop in extraction accuracy on our test set.

Here's exactly what we changed.

---

## Baseline: What We Were Doing Wrong

The original pipeline was straightforward to the point of being naive:

1. Extract full text from PDF
2. Send entire document + extraction prompt to GPT-4o
3. Parse JSON response

A typical insurance policy is 8,000–15,000 tokens. Our prompt added another 800. We were paying for all of it, every time, even though the fields we needed — policyholder name, coverage dates, premium amount, exclusions — were almost always in the first 20% of the document.

Three problems:
- **Sending irrelevant content**: boilerplate legal text, signature pages, appendices that never contain extractable fields
- **Using GPT-4o for everything**: even simple field extraction that a smaller model handles fine
- **No caching**: identical policy templates processed fresh every time

---

## Fix 1: Semantic Chunking, Not Full-Document Submission

The first change was the highest-leverage one. Instead of sending the full document, we identify which sections are relevant to each extraction task and send only those.

\`\`\`python
from typing import List

def extract_relevant_chunks(pages: List[str], target_fields: List[str]) -> str:
    # Score each page by keyword density for target fields
    field_keywords = {
        "policyholder":   ["insured", "policyholder", "named insured"],
        "coverage_dates": ["effective date", "expiry date", "policy period"],
        "premium":        ["premium", "total due", "annual premium"],
        "exclusions":     ["exclusion", "not covered", "excluded from"],
    }

    scored_pages = []
    for i, page_text in enumerate(pages):
        score = 0
        for field in target_fields:
            keywords = field_keywords.get(field, [])
            score += sum(1 for kw in keywords if kw.lower() in page_text.lower())
        scored_pages.append((score, i, page_text))

    # Take top-scoring pages up to token budget
    scored_pages.sort(reverse=True)
    selected = [text for score, _, text in scored_pages if score > 0]

    return "\\n\\n---\\n\\n".join(selected[:4])  # max 4 pages
\`\`\`

This alone cut average input tokens from ~11,000 to ~3,200 per document. The relevant content was almost always in the top-scoring pages. On our test set of 500 documents, extraction accuracy dropped by 0.3% — within noise.

---

## Fix 2: Prompt Compression

Our original system prompt was 847 tokens. It included detailed explanations of each field, examples of edge cases, and formatting instructions. It was written to be readable by a human reviewing the prompt — not optimised for token efficiency.

We rewrote it using a compressed format:

**Before (847 tokens):**
\`\`\`
You are an expert insurance document analyst. Your task is to extract specific 
information from insurance policy documents. Please carefully read the document 
and extract the following fields...

For the policyholder name: Look for the section labeled "Named Insured" or 
"Policyholder". This is typically found on the declarations page...
[continues for 800+ tokens]
\`\`\`

**After (203 tokens):**
\`\`\`
Extract fields from insurance document. Return JSON only, no explanation.

Fields:
- policyholder: string (Named Insured / Policyholder section)
- coverage_start: ISO date (Effective Date)
- coverage_end: ISO date (Expiry / Expiration Date)  
- premium_annual: number (Annual Premium, digits only)
- exclusions: string[] (Exclusions section, max 5 items)

If field not found: null. Dates: YYYY-MM-DD. Numbers: no currency symbols.
\`\`\`

Accuracy on our test set: identical. The model doesn't need the explanation — it already knows what "Named Insured" means. The verbose prompt was for our benefit, not the model's.

---

## Fix 3: Model Routing by Task Complexity

Not every extraction task needs GPT-4o. We classified tasks into two tiers:

**Tier 1 — Structured field extraction** (policyholder name, dates, premium amounts): These are pattern-matching tasks. The data is always in a predictable format. GPT-4o Mini handles them with the same accuracy as GPT-4o at 15x lower cost.

**Tier 2 — Semantic interpretation** (exclusion clause summarisation, coverage gap analysis, ambiguous clause resolution): These require genuine reasoning. GPT-4o stays here.

\`\`\`python
def route_to_model(task_type: str, document_complexity: str) -> str:
    tier1_tasks = {"field_extraction", "date_parsing", "amount_extraction"}
    
    if task_type in tier1_tasks and document_complexity != "high":
        return "gpt-4o-mini"
    return "gpt-4o"
\`\`\`

We determine \`document_complexity\` with a simple heuristic: if the document has more than 3 endorsements or contains non-standard clauses (flagged by keyword scan), it's "high". Otherwise "standard".

In practice, about 73% of our documents route to GPT-4o Mini. The cost difference is significant: GPT-4o is $5/$15 per million tokens (input/output). GPT-4o Mini is $0.15/$0.60.

---

## Fix 4: Template Caching with Semantic Hashing

Insurance documents from the same insurer often use identical policy templates. The boilerplate is the same — only the policyholder-specific fields change. We were paying to re-process the same template structure repeatedly.

We built a lightweight template cache:

\`\`\`python
import hashlib
import re

def get_template_hash(document_text: str) -> str:
    # Strip variable fields (dates, names, amounts) before hashing
    normalised = re.sub(r'\\b\\d{1,2}/\\d{1,2}/\\d{4}\\b', 'DATE', document_text)
    normalised = re.sub(r'\\$[\\d,]+\\.?\\d*', 'AMOUNT', normalised)
    normalised = re.sub(r'\\b[A-Z][a-z]+ [A-Z][a-z]+\\b', 'NAME', normalised)
    
    # Hash first 2000 chars (template structure is in the header)
    return hashlib.sha256(normalised[:2000].encode()).hexdigest()[:16]

def get_cached_schema(template_hash: str) -> dict | None:
    return redis_client.get(f"doc_schema:{template_hash}")

def cache_schema(template_hash: str, schema: dict) -> None:
    redis_client.setex(f"doc_schema:{template_hash}", 86400 * 7, json.dumps(schema))
\`\`\`

When we've seen a template before, we know exactly which pages contain which fields. We skip the scoring step and go straight to targeted extraction. Cache hit rate after two weeks: 61%.

---

## Fix 5: Confidence Scoring to Avoid Re-Extraction

Our original pipeline had no confidence signal — every extraction result was treated as equally reliable. When something looked wrong, a human reviewer would flag it and we'd re-run the whole document through GPT-4o.

We added a lightweight confidence check to the extraction response:

\`\`\`python
EXTRACTION_PROMPT_SUFFIX = """
After the JSON, on a new line add:
CONFIDENCE: <0-100> UNCERTAIN_FIELDS: <comma-separated field names or NONE>
"""

def parse_with_confidence(response: str) -> tuple[dict, int, list[str]]:
    lines = response.strip().split("\\n")
    confidence_line = next((l for l in lines if l.startswith("CONFIDENCE:")), None)
    
    if not confidence_line:
        return parse_json(response), 50, []
    
    parts = confidence_line.split("UNCERTAIN_FIELDS:")
    confidence = int(parts[0].replace("CONFIDENCE:", "").strip())
    uncertain = [] if "NONE" in parts[1] else [f.strip() for f in parts[1].split(",")]
    
    json_text = "\\n".join(l for l in lines if not l.startswith("CONFIDENCE:"))
    return parse_json(json_text), confidence, uncertain
\`\`\`

If confidence is below 70, we re-run — but only the uncertain fields, not the full document. If confidence is above 90, we skip human review entirely. This reduced our human review queue by 40% and eliminated most full-document re-runs.

---

## The Numbers

| Change | Token Reduction | Accuracy Impact |
|---|---|---|
| Semantic chunking | -71% input tokens | -0.3% |
| Prompt compression | -76% prompt tokens | 0% |
| Model routing (73% to Mini) | -85% cost on routed docs | 0% |
| Template caching (61% hit rate) | -61% on cached docs | 0% |
| Confidence-based re-extraction | -40% re-run volume | +1.2% (fewer bad results) |

Combined effect: $0.18 → $0.072 per document. 60% reduction.

The accuracy improvement on re-extraction is real — by only re-running uncertain fields with a targeted prompt, we get better results than re-running the full document with the generic prompt.

---

## What Didn't Work

A few things we tried that didn't pan out:

**Aggressive truncation**: Cutting documents to the first 30% regardless of content. Missed exclusion clauses that appear late in documents. Accuracy dropped 8% — not acceptable.

**Fine-tuning a smaller model**: We looked at fine-tuning GPT-3.5 on our extraction task. The data preparation and evaluation overhead wasn't worth it at our volume.

**Batching API calls**: OpenAI's Batch API offers 50% cost reduction with 24-hour turnaround. Our pipeline needs results in under 30 seconds. Didn't fit the use case.

---

## The Takeaway

Token cost optimisation isn't about sacrificing accuracy — it's about not paying for tokens that don't contribute to accuracy. Most LLM pipelines have significant waste: irrelevant context, verbose prompts, expensive models doing simple tasks, and repeated processing of identical inputs.

The 80% of savings came from two changes: semantic chunking and model routing. Start there.
`,
}

export default post
