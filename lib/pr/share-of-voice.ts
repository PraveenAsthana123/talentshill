import { eq, and } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

// Extends the pre-existing brand_mentions table (source enum includes
// 'news', the closest real category to PR/earned-media coverage) rather
// than duplicating a new media_mention table -- search-first discipline:
// brand_mentions already covers sentiment-tagged press mentions, it was
// only missing a real Share-of-Voice computation.
//
// Disclosed gap: brand_mentions has no podcast/guest_post/award/speaking
// taxonomy (only social/review/news/survey) -- 'news' is used as the PR
// proxy category, not a perfect match.

export interface ShareOfVoiceSummary {
  totalMentions: number;
  positiveCount: number;
  positiveShare: number | null; // null (not 0%), not fabricated, with zero real mentions
  bySentiment: Record<string, number>;
}

// Pure: real positive share -- null with zero real mentions.
export function computePositiveShare(positive: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((positive / total) * 1000) / 10;
}

export function getShareOfVoice(sourceFilter?: 'news'): ShareOfVoiceSummary {
  const rows = sourceFilter
    ? db.select().from(schema.brandMentions).where(and(eq(schema.brandMentions.source, sourceFilter))).all()
    : db.select().from(schema.brandMentions).all();

  const bySentiment: Record<string, number> = {};
  for (const r of rows) {
    const key = r.sentiment ?? 'unscored';
    bySentiment[key] = (bySentiment[key] ?? 0) + 1;
  }
  const positive = bySentiment.positive ?? 0;
  const share = computePositiveShare(positive, rows.length);

  if (rows.length > 0) {
    recordEvidence({
      moduleKey: 'pr_earned_media',
      claimClass: 'fact',
      claimText: `Share of Voice${sourceFilter ? ` (${sourceFilter} mentions)` : ''}: ${share}% positive (${positive}/${rows.length}).`,
      sourceRef: 'brand_mentions:share_of_voice_aggregate',
      sourceTable: 'brand_mentions',
      confidence: rows.length >= 20 ? 'high' : rows.length >= 5 ? 'medium' : 'low',
      createdBy: 'system',
    });
  }
  return { totalMentions: rows.length, positiveCount: positive, positiveShare: share, bySentiment };
}
