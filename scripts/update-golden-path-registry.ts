import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real, DB-backed catalog of 5 end-to-end flows (GP-01 through GP-05), each pointing to a real, file-existence-checked evidence doc -- the write-time guard rejects a broken path, same bug class SohamYoga\'s own golden path registry caught once. Includes a real on-demand audit re-checking all paths. Live-verified: all 5 seeded successfully, audit confirmed all 5 stillExists=true.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page yet (disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_golden-path-registry-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'golden_path_registry')).run();
console.log('Updated golden_path_registry -> real');
