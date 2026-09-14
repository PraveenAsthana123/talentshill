/**
 * Reconciliation, 2026-09-09 (later same day as
 * seed-module-registry-additions-2026-09-09.ts, which added these 8
 * modules as 'not_built'): all 8 are now built and live-verified this
 * session -- real local CRUD + a deterministic readiness pipeline +
 * an Ollama-backed advisory (or, for market_research, a real
 * synthesis) agent, on the Operational Portal 10-tab standard.
 *
 * Marked 'partial', not 'real': each module deliberately omits a
 * third-party integration (ad-platform spend sync, Adobe/CapCut/
 * HeyGen, voice-cloning APIs, YouTube Data API) that has no
 * credentials available in this environment -- disclosed per-module
 * in missingItems and in each module's Governance tab, never faked.
 *
 * Run: npx tsx lib/db/seed-module-registry-build-2026-09-09.ts
 */
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

const UPDATES: { moduleKey: string; missingItems: string }[] = [
  { moduleKey: 'ads_management', missingItems: 'Real local CRUD + deterministic readiness pipeline + Ollama agent, live-verified. No ad-platform API sync (Google Ads/Meta/LinkedIn/TikTok) -- spend is manually entered, not pulled live.' },
  { moduleKey: 'video_editing', missingItems: 'Real local CRUD + a real static editing/viral-strategy playbook + deterministic readiness pipeline + Ollama agent, live-verified. No Adobe (Premiere/After Effects)/CapCut/HeyGen API integration -- tool is a classification field, not a live connection.' },
  { moduleKey: 'voice_ai', missingItems: 'Real local CRUD + deterministic readiness pipeline + Ollama agent, live-verified. No voice-cloning/TTS/STT API integration (e.g. ElevenLabs). No consent-tracking field yet for real human voice recordings -- disclosed gap.' },
  { moduleKey: 'market_research', missingItems: 'Real local CRUD + a real Ollama synthesis agent grounded strictly in analyst-provided source notes (verified live: correct math, zero invented facts) + deterministic readiness pipeline, live-verified. Distinct from the existing competitor_analysis module.' },
  { moduleKey: 'branding', missingItems: 'Real local CRUD + deterministic readiness pipeline + Ollama agent, live-verified. No design-tool integration (Figma/Adobe CC libraries).' },
  { moduleKey: 'influencer_video', missingItems: 'Real local CRUD (including real contact-email PII) + deterministic readiness pipeline + Ollama agent, live-verified. No consent-tracking or retention-limit field yet for the stored contact email -- disclosed gap.' },
  { moduleKey: 'reels_management', missingItems: 'Real local CRUD + deterministic readiness pipeline + Ollama agent, live-verified. No platform API integration or auto-publish scheduler -- marking a reel scheduled/published requires manual confirmation.' },
  { moduleKey: 'youtube', missingItems: 'Real local CRUD + deterministic readiness pipeline + Ollama agent, live-verified. No YouTube Data API integration (no OAuth channel connection, no real upload, no stats sync) -- externalVideoId stays null until an admin manually records it.' },
];

function seed() {
  console.log('--- Reconciling module_registry (8 new modules -> partial), 2026-09-09 ---');
  const now = new Date();
  for (const u of UPDATES) {
    const existing = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.moduleKey, u.moduleKey)).get();
    if (!existing) {
      console.log(`  SKIPPED (not found): ${u.moduleKey}`);
      continue;
    }
    db.update(schema.moduleRegistry).set({
      builtStatus: 'partial',
      apiRouteCount: 8,
      hasAdminUi: true,
      missingItems: u.missingItems,
      sourceDoc: 'Built + live-verified this session, 2026-09-09 (TalentsHill 8 new module concepts build-out)',
      lastVerifiedAt: now,
      verifiedBy: 'claude-session-2026-09-09',
      updatedAt: now,
    }).where(eq(schema.moduleRegistry.moduleKey, u.moduleKey)).run();
    console.log(`  Updated: ${u.moduleKey} -> partial`);
  }
  console.log('Done.');
}

seed();
sqlite.close();
