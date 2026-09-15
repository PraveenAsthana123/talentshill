import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real named-account rollup grouping contact_submissions by real, normalized company name -- multi-stakeholder buying-committee visibility for accounts with >1 known contact. New item, added because TalentsHill is B2B (unlike SohamYoga\'s B2C model). Live-verified: real seeded data mostly shares company="unknown" (honestly reflected, 1 account); inserted 2 real tagged test contacts under a distinct company and confirmed correct multi-stakeholder grouping (accountScore=85, the real max), then cleaned up.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page yet (disclosed). Real underlying data is company-field-sparse for most seeded rows (most share "unknown"), limiting near-term usefulness until company data is enriched.',
  sourceDoc: 'docs/testing/2026-09-14_b2b-abm-engine-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'b2b_abm_engine')).run();
console.log('Updated b2b_abm_engine -> real');
