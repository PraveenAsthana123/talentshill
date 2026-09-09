/**
 * One-off reconciliation, 2026-09-09: fixes two real gaps found live while
 * answering a user question about total module count.
 *
 * 1. Three modules are real and built (have app/admin/ pages + working
 *    API routes) but were missing from module_registry entirely --
 *    appointments, competitor_analysis, marketing. Added as builtStatus
 *    'real'.
 * 2. The user named 8 new module concepts in rapid succession that do not
 *    exist anywhere in this codebase yet: ads management, video editing,
 *    voice AI, market research, branding, influencer video, reels
 *    management, YouTube (management). Per the Module Understanding
 *    Standard ("never silently omit an uncataloged module"), these are
 *    added as builtStatus 'not_built' so they show up honestly as
 *    planned/missing rather than disappearing from the list. "research"
 *    was a fragment duplicate of "market research", not a distinct item.
 *
 * Run: npx tsx lib/db/seed-module-registry-additions-2026-09-09.ts
 */
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

const DB_PATH = join(process.cwd(), 'data', 'talentshill.db');
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

type Row = {
  moduleKey: string;
  name: string;
  description: string;
  builtStatus: 'real' | 'partial' | 'not_built' | 'not_yet_cataloged';
  apiRouteCount: number;
  hasAdminUi: boolean;
  missingItems?: string;
};

const MODULES: Row[] = [
  // Real, built, but missing from the original registry seed
  { moduleKey: 'appointments', name: 'Appointments', description: 'Public booking flow + admin dashboard, real lead scoring', builtStatus: 'real', apiRouteCount: 7, hasAdminUi: true, missingItems: 'Now on the 10-tab Operational Portal standard (Manual/Pipeline/Agentic/Monitoring/Dashboard/Report/Governance/User Story/Testing/Log&Tracking), 2026-09-09' },
  { moduleKey: 'competitor_analysis', name: 'Competitor Analysis', description: 'Admin-only market-research intelligence, competitor research pipeline + agent', builtStatus: 'real', apiRouteCount: 7, hasAdminUi: true, missingItems: 'Now on the 10-tab Operational Portal standard, 2026-09-09 (pilot module for the standard)' },
  { moduleKey: 'marketing', name: 'Marketing Hub', description: 'Marketing section landing/overview page', builtStatus: 'real', apiRouteCount: 0, hasAdminUi: true },

  // Requested this session, not yet built anywhere in this codebase
  { moduleKey: 'ads_management', name: 'Ads Management', description: 'Paid ad campaign management (e.g. Meta/Google Ads) -- requested 2026-09-09, not yet scoped or built', builtStatus: 'not_built', apiRouteCount: 0, hasAdminUi: false, missingItems: 'No schema, no API routes, no admin UI exist yet' },
  { moduleKey: 'video_editing', name: 'Video Editing', description: 'Video asset editing/production workflow -- requested 2026-09-09, not yet scoped or built', builtStatus: 'not_built', apiRouteCount: 0, hasAdminUi: false, missingItems: 'No schema, no API routes, no admin UI exist yet' },
  { moduleKey: 'voice_ai', name: 'Voice AI', description: 'Voice/audio AI capability (e.g. voice agent, TTS/STT) -- requested 2026-09-09, not yet scoped or built', builtStatus: 'not_built', apiRouteCount: 0, hasAdminUi: false, missingItems: 'No schema, no API routes, no admin UI exist yet' },
  { moduleKey: 'market_research', name: 'Market Research', description: 'Broader market-research capability beyond competitor_analysis -- requested 2026-09-09, not yet scoped or built', builtStatus: 'not_built', apiRouteCount: 0, hasAdminUi: false, missingItems: 'Distinct from the existing real competitor_analysis module -- scope not yet clarified with user' },
  { moduleKey: 'branding', name: 'Branding', description: 'Brand asset/guideline management -- requested 2026-09-09, not yet scoped or built', builtStatus: 'not_built', apiRouteCount: 0, hasAdminUi: false, missingItems: 'No schema, no API routes, no admin UI exist yet' },
  { moduleKey: 'influencer_video', name: 'Influencer Video', description: 'Influencer-partnership video content management -- requested 2026-09-09, not yet scoped or built', builtStatus: 'not_built', apiRouteCount: 0, hasAdminUi: false, missingItems: 'No schema, no API routes, no admin UI exist yet' },
  { moduleKey: 'reels_management', name: 'Reels Management', description: 'Short-form vertical video (Reels/Shorts) management -- requested 2026-09-09, not yet scoped or built', builtStatus: 'not_built', apiRouteCount: 0, hasAdminUi: false, missingItems: 'No schema, no API routes, no admin UI exist yet' },
  { moduleKey: 'youtube', name: 'YouTube Management', description: 'YouTube channel/upload management -- requested 2026-09-09, not yet scoped or built', builtStatus: 'not_built', apiRouteCount: 0, hasAdminUi: false, missingItems: 'No schema, no API routes, no admin UI exist yet' },
];

function seed() {
  console.log('--- Reconciling module_registry, 2026-09-09 ---');
  const now = new Date();
  for (const m of MODULES) {
    const existing = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.moduleKey, m.moduleKey)).get();
    if (existing) {
      db.update(schema.moduleRegistry).set({
        name: m.name,
        description: m.description,
        builtStatus: m.builtStatus,
        apiRouteCount: m.apiRouteCount,
        hasAdminUi: m.hasAdminUi,
        missingItems: m.missingItems ?? null,
        sourceDoc: 'reconciliation session, 2026-09-09',
        lastVerifiedAt: now,
        verifiedBy: 'claude-session-2026-09-09',
        updatedAt: now,
      }).where(eq(schema.moduleRegistry.moduleKey, m.moduleKey)).run();
      console.log(`  Updated: ${m.moduleKey}`);
    } else {
      db.insert(schema.moduleRegistry).values({
        id: randomUUID(),
        moduleKey: m.moduleKey,
        name: m.name,
        description: m.description,
        builtStatus: m.builtStatus,
        apiRouteCount: m.apiRouteCount,
        hasAdminUi: m.hasAdminUi,
        missingItems: m.missingItems ?? null,
        sourceDoc: 'reconciliation session, 2026-09-09',
        lastVerifiedAt: now,
        verifiedBy: 'claude-session-2026-09-09',
        createdAt: now,
        updatedAt: now,
      }).run();
      console.log(`  Inserted: ${m.moduleKey}`);
    }
  }
  console.log('Done.');
}

seed();
sqlite.close();
