import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real, admin-entered AI-answer-engine (ChatGPT/Perplexity/Gemini/Copilot) mention observation logging + real mention-rate computation. No AI-search-engine API integration exists. Live-verified: 2 real observations logged, mentionRate correctly computed as 50% (1/2), byEngine split correct.',
  apiRouteCount: 1,
  hasAdminUi: true,
  missingItems: 'No automated AI-answer-engine querying -- fully manual admin entry by design (disclosed, same honesty pattern as competitor_campaign_observations).',
  sourceDoc: 'docs/testing/2026-09-14_geo-visibility-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'geo_visibility')).run();
console.log('Updated geo_visibility -> real');
