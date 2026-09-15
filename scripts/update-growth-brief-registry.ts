import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real pure-composition brief from Evidence Ledger (#1) + KPI Engine (#2) + Opportunity Engine (#3) + Growth Readiness Score (#7) -- no new data source, no LLM call. Live-verified: generated brief exactly matched the independently-verified 82.7 readiness score, all 6 real KPI dimensions, the real top-ranked lead_quality opportunity, and the real 43-record evidence count.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page yet (disclosed). No PDF/export format -- plain text only.',
  sourceDoc: 'docs/testing/2026-09-14_growth-brief-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'presales_growth_brief')).run();
console.log('Updated presales_growth_brief -> real');
