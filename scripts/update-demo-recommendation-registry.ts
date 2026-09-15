import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real composition: resolves the Opportunity Engine\'s (#3) top-ranked real candidate against the real module_registry table, returning a real module name/description to demo -- never a fabricated module. Live-verified: correctly resolved to the real "Leads" module with the exact real rationale.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page yet (disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_demo-recommendation-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'demo_recommendation_engine')).run();
console.log('Updated demo_recommendation_engine -> real');
