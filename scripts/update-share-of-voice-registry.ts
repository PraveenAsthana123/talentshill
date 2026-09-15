import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real Share-of-Voice computation extending the pre-existing brand_mentions table (search-first discovery: it already covered sentiment-tagged mentions, only missing this computation). Live-verified against 400 real seeded mentions: 100/400=25% positive share, hand-verified exact match; news-only filter honestly returned null with zero real news-sourced mentions.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'brand_mentions has no podcast/guest_post/award/speaking taxonomy (only social/review/news/survey) -- "news" is the closest real PR-coverage proxy, disclosed as an imperfect match. API-only, no dedicated UI page.',
  sourceDoc: 'docs/testing/2026-09-14_share-of-voice-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'pr_earned_media')).run();
console.log('Updated pr_earned_media -> real');
