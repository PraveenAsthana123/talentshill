import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real, admin-authored "For X who Y, TalentsHill is Z, unlike A, we B" positioning template -- deterministic rendering, never LLM-generated. Live-verified: created TalentsHill\'s real positioning statement, rendered text matched exactly.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page yet (disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_positioning-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'positioning_statement')).run();
console.log('Updated positioning_statement -> real');
