import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  // Stays 'partial' -- the real YouTube Data API/OAuth blocker is
  // unaddressed. This update records that the per-video tracker (which
  // had regressed to 0 real rows) was re-exercised against real data.
  missingItems: 'Real video CRUD + deterministic per-video readiness pipeline + Ollama advisor agent + real Channel Growth Engine (real admin-entered snapshots, real growth-delta pipeline, real Ollama narrative). RE-VERIFIED 2026-09-14: the per-video tracker had regressed to 0 real rows; created a real video and confirmed the full pipeline+agent chain works end-to-end. No YouTube Data API/OAuth integration exists -- externalVideoId stays null until an admin manually records it, a real, unaddressed external dependency, not a bug.',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'youtube')).run();
console.log('Updated youtube missing_items (per-video tracker re-exercised, stays partial)');
