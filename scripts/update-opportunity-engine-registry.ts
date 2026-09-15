import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real gap-ranking engine over the KPI Engine (#2): reads real kpi_snapshot rows, flags below-threshold or no-data dimensions, ranks by disclosed impact x feasibility x real confidence, recommends a real existing module as remediation. Live-verified: correctly ranked a real 49.8 lead_quality gap above two no-data gaps.',
  apiRouteCount: 2,
  hasAdminUi: true,
  missingItems: 'THRESHOLDS/SOLUTION_MAP are hardcoded editorial judgment, disclosed as such -- not derived from historical outcome data. getLatestOpportunities() returns the full accumulated history across recompute runs, not deduped to only the most recent run (disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_opportunity-engine-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'opportunity_benchmark_engine')).run();
console.log('Updated opportunity_benchmark_engine -> real');
