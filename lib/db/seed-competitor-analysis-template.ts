/**
 * Seeds ONE template row in competitor_analysis, clearly marked
 * isTemplate=true, showing the intended structure for real competitor
 * research the team will add later. Deliberately does NOT invent real
 * competitor names, pricing, or offerings -- see the schema comment on
 * competitorAnalysis in lib/db/schema.ts for why. Idempotent.
 * Run: npx tsx lib/db/seed-competitor-analysis-template.ts
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

function seed() {
  const service = db.select().from(schema.services).where(eq(schema.services.slug, 'digital-marketing')).get();
  if (!service) {
    console.log('digital-marketing service not found -- run seed-marketing-services.ts first');
    return;
  }

  const existing = db.select().from(schema.competitorAnalysis)
    .where(eq(schema.competitorAnalysis.isTemplate, true)).get();
  if (existing) {
    console.log('Template row already exists, skipping');
    return;
  }

  const now = new Date();
  db.insert(schema.competitorAnalysis).values({
    id: randomUUID(),
    serviceId: service.id,
    competitorName: '[Fill in: real competitor name]',
    competitorWebsite: '[Fill in: their real website URL]',
    offeringSummary: '[Fill in: what they actually offer for this service, based on real research -- their own site, pricing page, sales materials]',
    pricingNotes: '[Fill in: their real published or observed pricing, if available]',
    strengthsWeaknesses: '[Fill in: honest assessment of where they are stronger/weaker than us, based on real comparison]',
    sampleDeliverables: JSON.stringify([
      { name: '[Sample deliverable name]', description: '[What this deliverable would actually contain if we produced it for a real client]' },
    ]),
    status: 'needs_research',
    isTemplate: true,
    lastResearchedAt: null,
    researchedBy: null,
    createdAt: now,
    updatedAt: now,
  }).run();

  console.log('Created 1 template row (isTemplate=true) under the digital-marketing service.');
  console.log('Add real research via the admin UI at /admin/competitor-analysis -- do not fabricate entries.');
}

seed();
