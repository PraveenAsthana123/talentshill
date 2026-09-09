/**
 * Seed script for 4 original blog posts covering the new digital-marketing
 * and AI service lines (digital-marketing, agentic-ai, enterprise-rag,
 * market-research/creator-video-marketing pages added this session).
 * Idempotent -- safe to re-run. Run: npx tsx lib/db/seed-marketing-blog.ts
 */
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

const sqlite = new Database(join(process.cwd(), 'data', 'talentshill.db'));
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function ensureCategory(name: string, slug: string): string {
  const existing = db.select().from(schema.blogCategories).where(eq(schema.blogCategories.slug, slug)).get();
  if (existing) return existing.id;
  const id = randomUUID();
  db.insert(schema.blogCategories).values({ id, name, slug, description: null, color: null, sortOrder: 0 }).run();
  return id;
}

const digitalMarketingCatId = ensureCategory('Digital Marketing', 'digital-marketing');
const author = db.select().from(schema.blogAuthors).get();
const authorId = author?.id;

const POSTS = [
  {
    title: 'Why Digital Marketing Needs an Agentic AI Layer, Not Just Automation',
    summary: 'The difference between rule-based marketing automation and agentic AI that plans, executes, and reports with human approval on consequential actions.',
    content: `Most "AI marketing" today is really rule-based automation: if a form is submitted, send an email; if a lead scores above 80, notify sales. That's useful, but it isn't AI in any meaningful sense — it's a workflow engine with a marketing skin.

Agentic AI is different. A marketing agent can research a competitor's latest campaign, draft a response, propose a budget reallocation, and hand all of it to a human for approval before anything goes live. The agent does the research and drafting; a person still makes the call on anything that spends money or reaches a customer.

That approval boundary matters more than the AI itself. We deliberately architect our marketing agents around one rule: **AI recommends, a human approves consequential actions, the system executes, and results are measured.** No agent in our stack autonomously publishes content or spends ad budget without that checkpoint.

The payoff isn't "fully autonomous marketing" — it's marketers spending less time on research and drafting, and more time on judgment calls that actually need a human.`,
    categorySlug: 'digital-marketing',
    tags: ['Agentic AI', 'Marketing Automation', 'AI Agents'],
  },
  {
    title: 'What Enterprise RAG Actually Requires Before It\'s Production-Ready',
    summary: 'A working RAG demo and a production RAG system are different things. Here is the evaluation checklist that separates them.',
    content: `It's easy to stand up a RAG prototype: embed some documents, wire up a vector search, connect an LLM. It's much harder to know whether it's actually trustworthy.

Before we call any RAG system production-ready, we evaluate it against a specific set of metrics, not a demo that "looks right" on a handful of test questions:

- **Retrieval quality**: precision, recall, hit rate, and mean reciprocal rank against a real evaluation set
- **Generation quality**: faithfulness (does the answer follow the retrieved evidence?), groundedness, and a measured hallucination rate
- **Operations**: latency, token consumption, and cost per query at realistic load

A RAG system with real schema and zero rows of actual usage isn't a RAG system yet — it's a RAG-shaped piece of infrastructure. The difference only shows up once real documents are ingested and real queries are run against it and measured.

That's also why we treat Secure RAG (RBAC/ABAC-aware retrieval) as a first-class requirement for enterprise deployments, not an add-on: a knowledge assistant that retrieves documents a user isn't authorized to see is a security incident waiting to happen, not a feature.`,
    categorySlug: 'digital-marketing',
    tags: ['RAG', 'Enterprise AI', 'AI Governance'],
  },
  {
    title: 'Market Research Doesn\'t Have to End at a PDF',
    summary: 'Turning a one-time competitive intelligence report into a continuously queryable, evidence-linked research asset.',
    content: `Traditional market research delivers a report. You read it once, reference it a few times, and it goes stale within a quarter.

We think research should stay usable after delivery. Once a competitive intelligence project is complete, the underlying evidence — competitor pricing pages, review data, positioning language, market sizing sources — can be indexed into a research-specific knowledge base. From there, a client can keep asking follow-up questions: which competitors are strongest in a specific region, how their pricing compares, where the biggest gaps in the market actually are.

That only works if every answer is evidence-linked back to a real source, not generated from the model's general knowledge. A research assistant that can't cite where a claim came from isn't more useful than the original PDF — it's just harder to fact-check.

The commercial shape follows naturally: research shifts from a one-time deliverable to an ongoing subscription, because market and competitor conditions don't stay static any longer than the report does.`,
    categorySlug: 'digital-marketing',
    tags: ['Market Research', 'Competitive Intelligence', 'RAG'],
  },
  {
    title: 'Optimizing for Search Engines and AI Answer Engines Are Now Two Different Jobs',
    summary: 'Traditional SEO and generative engine optimization (GEO) share a foundation but diverge in what actually earns visibility.',
    content: `Search engine optimization has a well-understood playbook: technical crawlability, keyword-mapped content, backlinks, and structured data. Generative engine optimization — earning visibility in AI answer engines like ChatGPT, Perplexity, and Google AI Overviews — shares some of that foundation but isn't the same job.

An AI answer engine isn't ranking ten blue links; it's synthesizing a single answer from a small number of sources it trusts enough to cite. That changes what matters:

- **Clear, extractable structure** — content that states a claim and its supporting evidence plainly is easier for a model to cite accurately than content optimized purely for keyword density
- **Source credibility signals** that overlap with, but aren't identical to, traditional backlink authority
- **Being retrievable at the passage level**, not just the page level — an answer engine often pulls one paragraph, not a whole article

We treat SEO and GEO as related but separately measured disciplines: rank tracking for traditional search, and a distinct visibility check for how (and whether) a brand shows up in AI-generated answers. Optimizing only for one is no longer optimizing for the whole way people actually find information.`,
    categorySlug: 'digital-marketing',
    tags: ['SEO', 'GEO', 'Generative Engine Optimization'],
  },
];

function seed() {
  console.log('--- Seeding digital marketing blog posts ---');
  for (const p of POSTS) {
    const existing = db.select().from(schema.blogPosts).where(eq(schema.blogPosts.slug, slugify(p.title))).get();
    if (existing) {
      console.log(`  Skipped (already exists): ${p.title}`);
      continue;
    }
    const id = randomUUID();
    const now = new Date();
    db.insert(schema.blogPosts).values({
      id,
      title: p.title,
      slug: slugify(p.title),
      summary: p.summary,
      content: p.content,
      coverImage: null,
      status: 'published',
      featured: false,
      authorId: authorId || null,
      metaTitle: null,
      metaDescription: p.summary,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    }).run();
    db.insert(schema.blogPostCategories).values({ postId: id, categoryId: digitalMarketingCatId }).run();
    for (const tagName of p.tags) {
      let tag = db.select().from(schema.blogTags).where(eq(schema.blogTags.slug, slugify(tagName))).get();
      if (!tag) {
        const tagId = randomUUID();
        db.insert(schema.blogTags).values({ id: tagId, name: tagName, slug: slugify(tagName) }).run();
        tag = { id: tagId, name: tagName, slug: slugify(tagName) };
      }
      db.insert(schema.blogPostTags).values({ postId: id, tagId: tag.id }).run();
    }
    console.log(`  Created: ${p.title}`);
  }
  console.log('--- Done ---');
}

seed();
