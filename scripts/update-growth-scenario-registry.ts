import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real compound-growth projection from real current KPI Engine (#2) values under 3 disclosed monthly assumption rates (2%/5%/10%). Dimensions with no real data are excluded, not projected from a fabricated 0 baseline. Live-verified: month-1 lead_generation projections (163.2/168/176) hand-verified exact match to 160*1.02/1.05/1.10.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page/chart yet (disclosed). SCENARIO_RATES are editorial assumptions, not derived from historical growth data.',
  sourceDoc: 'docs/testing/2026-09-14_growth-scenario-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'growth_scenario_simulator')).run();
console.log('Updated growth_scenario_simulator -> real');
