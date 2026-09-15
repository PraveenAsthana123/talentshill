import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real, admin-logged conversion-friction findings (7 types, severity 1-5) with a real readiness score (100 minus a severity^1.5-weighted penalty per open finding, disclosed formula). No automated site crawler/UX-analytics integration exists. Live-verified: severity-4 finding correctly dropped the score to 76; marking it fixed correctly restored it to 100.',
  apiRouteCount: 1,
  hasAdminUi: true,
  missingItems: 'Fully manual admin entry by design -- no automated Lighthouse/crawler/heatmap integration (disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_cro-friction-engine-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'cro_friction_engine')).run();
console.log('Updated cro_friction_engine -> real');
