import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real company-wide confidence-weighted composite over all 6 real KPI Engine (#2) dimensions -- extends the pre-existing analytics-health-pipeline.ts composite (email/contact-program scoped only) to the whole company. A dimension with no real data is excluded from the average, not treated as 0. Live-verified: score=82.7 hand-checked against the real underlying KPI values.',
  apiRouteCount: 2,
  hasAdminUi: true,
  missingItems: 'NORMALIZE_TARGET values (lead_generation=50, ad_efficiency=10%) are disclosed hardcoded editorial judgment, not derived from historical benchmarks.',
  sourceDoc: 'docs/testing/2026-09-14_growth-readiness-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'growth_readiness_score')).run();
console.log('Updated growth_readiness_score -> real');
