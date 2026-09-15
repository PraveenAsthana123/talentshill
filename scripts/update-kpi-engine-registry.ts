import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real 6-dimension KPI engine (lead_generation, lead_quality, email_engagement, webinar_engagement, ad_efficiency, operational_health), each computed from real tables with a real sample size and confidence. Live-verified: 160 real leads, 85% real email open rate, 95.9% real operational success rate; 2 dimensions honestly null (no real data yet). Writes real evidence rows per dimension.',
  apiRouteCount: 2,
  hasAdminUi: true,
  missingItems: 'Snapshots are point-in-time (recompute-on-demand via the admin UI button), not yet on a scheduled cron. No historical trend chart yet (kpi_snapshot rows accumulate but the UI only shows the latest).',
  sourceDoc: 'docs/testing/2026-09-14_kpi-engine-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'kpi_engine')).run();
console.log('Updated kpi_engine -> real');
