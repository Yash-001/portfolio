import type { BlogPostFull } from '@/types/content'
import { BLOG_AUTHOR } from '../author'

const post: BlogPostFull = {
  id:          'blog-8',
  slug:        'senior-engineer-lessons-7-years',
  title:       "Seven Years as a Software Engineer: What I Got Wrong and What I'd Do Differently",
  excerpt:     "The technical decisions I regret, the architectural patterns I wish I'd learned earlier, and the non-technical skills that turned out to matter more than I expected. An honest retrospective.",
  category:    'Career',
  author:      BLOG_AUTHOR,
  tags:        [{ name: 'Career', slug: 'career' }, { name: 'Engineering', slug: 'engineering' }, { name: 'Lessons', slug: 'lessons' }],
  status:      'published',
  featured:    false,
  readingTime: 6,
  publishedAt: '2023-11-12',
  coverImage:  undefined,
  content: `
## Why Write This

I've been writing software professionally for seven years. I don't think I've figured it out — but I've made enough specific mistakes that I have opinions about them now, and I wish someone had been more direct with me about some of this earlier.

---

## The Technical Mistakes

### I over-engineered early and under-engineered later

My first few years, I built things that were too complex. Microservices for systems that had three users. Event-driven architectures for workflows that ran once a day. I was learning patterns and wanted to use them. The result was systems that were hard to debug, hard to deploy, and hard to explain to the next person.

Then I overcorrected. I started defaulting to the simplest possible thing — which is usually right, but I took it too far. I'd avoid abstractions that were genuinely warranted, skip proper error handling because "we can add it later," and defer database indexing until queries were already slow in production.

The right call is: start simple, but be honest about which corners you're cutting. "We can add it later" only works if you actually go back.

### I didn't take database design seriously enough

For the first three or four years, I treated the database as a detail. I'd design the application layer carefully and let the schema follow from it. This is backwards.

The schema is the most expensive thing to change. Application code is easy to refactor. A poorly designed schema — wrong data types, missing constraints, no thought given to query patterns — compounds over time. You end up with nullable columns that should never be null, string fields storing what should be enums, and queries that can't be indexed because the data model doesn't support it.

I now spend more time on schema design than on almost anything else at the start of a project. It's the decision that's hardest to undo.

### I ignored observability until something broke

Logging, metrics, tracing — I treated these as things you add when you have a problem. The issue is that when you have a problem in production, you need observability to diagnose it. If you add it after the fact, you're flying blind during the incident and adding instrumentation while things are on fire.

The first time I had a production incident with no useful logs, no metrics, and no way to tell which part of the system was failing, I learned this lesson properly. It took about six hours to diagnose something that would have taken twenty minutes with basic structured logging and a latency histogram.

Observability is not a feature you add later. It's part of the system.

### I conflated "works on my machine" with "works"

Early on, I'd test locally, see it working, and ship it. I didn't think carefully about what was different between my environment and production — different data volumes, different concurrency, different network latency, different OS behaviour.

The most embarrassing version of this: a background job that worked perfectly locally because my dev database had 200 rows, but timed out in production because it was doing a full table scan on 800,000 rows. I hadn't written a test with realistic data volume, and I hadn't checked the query plan.

Now I always ask: what's different about production that I'm not testing for?

---

## The Non-Technical Mistakes

### I underestimated how much writing matters

I used to think that if the code was good, the communication around it was secondary. I was wrong.

The engineers I've learned the most from are all good writers. They write clear design documents before building. They write commit messages that explain why, not just what. They write postmortems that are honest about what went wrong without being defensive.

Good writing forces clear thinking. If you can't explain a design decision in plain language, you probably don't understand it well enough yet. I've talked myself out of bad approaches more times by trying to write them down than by any other method.

### I didn't ask for feedback early enough

I'd work on something for a week, get it to a state I was happy with, then ask for a code review. By that point, I was attached to the approach. If the reviewer suggested a fundamentally different direction, I'd resist it — not because they were wrong, but because I'd already invested time in my approach.

The better habit is to share a rough design or a draft PR early, before you're invested. "Here's what I'm thinking, does this make sense?" takes ten minutes and can save days of work in the wrong direction.

I still have to remind myself to do this. The pull toward showing finished work is real.

### I optimised for looking busy instead of being useful

In my first job, I equated long hours with good work. I'd stay late, take on more tickets, keep my PR count high. I thought this was what being a good engineer looked like.

What I was actually doing was spreading myself thin, doing shallow work on many things instead of deep work on the things that mattered. The most impactful engineers I've worked with are not the ones with the most commits. They're the ones who identify the right problem to solve and solve it thoroughly.

Being useful means understanding what actually matters to the team and the product, and directing your energy there. That's a harder skill than writing code.

### I avoided conversations I should have had

There were times I knew a technical decision was wrong — a deadline being set without understanding the complexity, a design that would cause problems later, a process that was slowing the team down — and I didn't say anything clearly. I'd hint at it in a PR comment or mention it briefly in a meeting and move on.

The conversations I avoided always came back. The deadline got missed. The design caused the problems I'd anticipated. The process kept slowing things down.

Being direct about technical concerns, clearly and early, is part of the job. It's uncomfortable, especially when you're junior and the decision is being made by someone senior. But the discomfort of the conversation is almost always smaller than the cost of not having it.

---

## What I'd Tell Myself at Year One

Read the code of systems you use. Not just the documentation — the actual source code. You learn more about how software works from reading good code than from almost anything else.

Get comfortable being wrong in public. The engineers who improve fastest are the ones who ask questions without worrying about how they look, share work-in-progress before it's polished, and change their minds when they get better information.

The technical skills matter, but they're not the ceiling. At some point the constraint on your impact isn't whether you can write good code — it's whether you can communicate clearly, work well with others, and understand what's actually worth building.
`,
}

export default post
