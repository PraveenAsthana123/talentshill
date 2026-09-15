import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real, one-time admin-confirmed classification of TalentsHill\'s own business vertical (distinct from the industries table, which models industries TalentsHill sells INTO) + real applicable KPI Engine dimension list. Live-verified: real production row created ("B2B AI & Digital Marketing Consultancy", all 6 real KPI dimensions applicable), re-confirm-updates rather than duplicates (verified via real unique-constraint upsert).',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page yet (disclosed). Single vertical only -- TalentsHill has one real business model, not multiple.',
  sourceDoc: 'docs/testing/2026-09-14_vertical-pack-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'vertical_pack')).run();
console.log('Updated vertical_pack -> real');
