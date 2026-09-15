import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real catalog of TalentsHill\'s own live-verified built modules (builtStatus=real only, never partial/not_built), distinct from app/demo\'s generic public AI/robotics solution-demo page -- for internal/sales-enablement use. Live-verified: real=55, partial=11, notBuilt=10, reflecting the true current module_registry state.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated admin UI page yet (disclosed). Not client-facing.',
  sourceDoc: 'docs/testing/2026-09-14_demo-catalog-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'demo_catalog_own_modules')).run();
console.log('Updated demo_catalog_own_modules -> real');
