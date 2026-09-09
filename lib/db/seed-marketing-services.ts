/**
 * Seed script for the Digital Marketing + AI service catalog rows.
 * Original 7 (digital marketing, ads management, market research,
 * performance marketing, SEO/GEO, AI automation, AI strategy) added per
 * explicit request. 3 more (agentic AI, enterprise RAG, influencer/video/
 * viral growth) added after reconciling against a shared ChatGPT
 * "AI Marketing Services Showcase" transcript -- see
 * docs/chatgpt-extracts/2026-09-08_talentshill-ai-marketing-services-showcase.md
 * in the sibling sohamyoga repo for the full enumeration and what was
 * deliberately left out of scope. Idempotent -- safe to re-run.
 * Run: npx tsx lib/db/seed-marketing-services.ts
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

const SERVICES = [
  {
    slug: 'digital-marketing', name: 'Digital Marketing', category: 'Digital Marketing',
    shortDesc: 'Full-funnel digital marketing strategy, execution, and measurement.',
    useCases: ['Multi-channel campaigns', 'Marketing automation', 'Content strategy', 'Lifecycle marketing'],
  },
  {
    slug: 'ads-management', name: 'Ads Management', category: 'Digital Marketing',
    shortDesc: 'Paid search, paid social, and programmatic advertising, managed end-to-end.',
    useCases: ['Google & Bing Ads', 'Meta & LinkedIn Ads', 'Programmatic display', 'Budget optimization'],
  },
  {
    slug: 'market-research', name: 'Market Research', category: 'Digital Marketing',
    shortDesc: 'Competitive intelligence, audience research, and market sizing to ground strategy in evidence.',
    useCases: ['Competitive intelligence', 'Audience segmentation', 'Survey research', 'Market sizing'],
  },
  {
    slug: 'performance-marketing', name: 'Performance Marketing', category: 'Digital Marketing',
    shortDesc: 'Conversion, acquisition-cost, and lifetime-value optimization tied directly to revenue.',
    useCases: ['Conversion rate optimization', 'CAC optimization', 'Attribution modeling', 'Growth experimentation'],
  },
  {
    slug: 'seo-geo', name: 'SEO & GEO', category: 'Digital Marketing',
    shortDesc: 'Search engine optimization plus generative-engine optimization for visibility in AI answer engines.',
    useCases: ['Technical SEO', 'Generative engine optimization', 'Local & international SEO', 'Digital PR'],
  },
  {
    slug: 'ai-automation', name: 'AI Automation', category: 'AI Solutions',
    shortDesc: 'AI-driven automation for marketing operations, lead handling, and reporting.',
    useCases: ['Workflow automation', 'AI lead scoring', 'Automated personalization', 'Conversational automation'],
  },
  {
    slug: 'ai-strategy', name: 'AI Strategy', category: 'AI Solutions',
    shortDesc: 'AI readiness, roadmap, and governance advisory for enterprises adopting AI.',
    useCases: ['AI readiness assessment', 'Use-case prioritization', 'Responsible AI governance', 'AI center of excellence'],
  },
  {
    slug: 'agentic-ai', name: 'Agentic AI', category: 'AI Solutions',
    shortDesc: 'Multi-agent systems and workflow automation, with human approval on consequential actions.',
    useCases: ['Multi-agent systems', 'MCP integration', 'AI sales & marketing agents', 'Workflow automation'],
  },
  {
    slug: 'enterprise-rag', name: 'Enterprise RAG', category: 'AI Solutions',
    shortDesc: 'Retrieval-augmented generation grounded in your own enterprise knowledge, evaluated for quality.',
    useCases: ['Enterprise knowledge assistant', 'Multimodal & GraphRAG', 'Secure RAG (RBAC/ABAC)', 'RAG evaluation & optimization'],
  },
  {
    slug: 'creator-video-marketing', name: 'Influencer, Video & Viral Growth', category: 'Digital Marketing',
    shortDesc: 'Creator partnerships, short-form video production, and trend-driven content growth.',
    useCases: ['Influencer discovery & outreach', 'Short-form & AI video production', 'Viral content strategy', 'Creator analytics'],
  },
];

function seed() {
  console.log('--- Seeding marketing/AI service catalog ---');
  const now = new Date();
  SERVICES.forEach((s, i) => {
    const existing = db.select().from(schema.services).where(eq(schema.services.slug, s.slug)).get();
    if (existing) {
      db.update(schema.services).set({
        name: s.name, category: s.category, shortDesc: s.shortDesc,
        useCases: JSON.stringify(s.useCases), updatedAt: now,
      }).where(eq(schema.services.slug, s.slug)).run();
      console.log(`  Updated: ${s.slug}`);
    } else {
      db.insert(schema.services).values({
        id: randomUUID(), name: s.name, slug: s.slug, category: s.category,
        shortDesc: s.shortDesc, longDesc: null, icon: null,
        tags: '[]', useCases: JSON.stringify(s.useCases),
        sortOrder: 100 + i, isActive: true, createdAt: now, updatedAt: now,
      }).run();
      console.log(`  Created: ${s.slug}`);
    }
  });
  console.log(`--- Done: ${SERVICES.length} services seeded ---`);
}

seed();
