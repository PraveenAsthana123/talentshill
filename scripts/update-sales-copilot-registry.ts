import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real deterministic talking-point composer from KPI Engine (#2) + Competitor Benchmark (#4) -- no live chat, no LLM call. Honestly surfaces both favorable and unfavorable competitor gaps (never hides a trailing gap). Live-verified: real KPI values and a real Microsoft digital_presence gap (-18) both appeared exactly as computed by their source engines.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page yet (disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_sales-copilot-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'sales_copilot')).run();
console.log('Updated sales_copilot -> real');
