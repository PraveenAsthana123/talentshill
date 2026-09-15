import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real per-channel conversion rate (contacts.source vs real lifecycleStage=engaged) and real cross-channel lead dedup (contact_submissions grouped by email). Live-verified against real data: import channel 46.4% (510/1100), manual 0% (0/5); 0 real duplicate touches in the current dataset.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only, no dedicated UI page yet (disclosed).',
  sourceDoc: 'docs/testing/2026-09-14_channel-attribution-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'channel_attribution')).run();
console.log('Updated channel_attribution -> real');
