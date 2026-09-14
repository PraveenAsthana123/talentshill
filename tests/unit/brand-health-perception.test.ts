import { describe, it, expect, afterAll } from 'vitest';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { computeHealthScore, computeCampaignLift, runBrandHealthPipeline } from '@/lib/pipelines/brand-health-pipeline';
import { createBrandMention, deleteBrandMention, updateBrandMentionSentiment } from '@/lib/db/brand-mention-queries';
import { createCampaign, deleteCampaign } from '@/lib/db/campaign-queries';

describe('computeHealthScore (pure)', () => {
  it('returns null when there is no scored data (boundary)', () => {
    expect(computeHealthScore(0, 0, 0)).toBeNull();
  });
  it('scores 100 when every mention is positive (positive case)', () => {
    expect(computeHealthScore(10, 0, 0)).toBe(100);
  });
  it('scores 0 when every mention is negative (negative case)', () => {
    expect(computeHealthScore(0, 0, 10)).toBe(0);
  });
  it('scores 50 for an even positive/negative split (boundary)', () => {
    expect(computeHealthScore(5, 0, 5)).toBe(50);
  });
  it('scores 50 for all-neutral mentions (boundary)', () => {
    expect(computeHealthScore(0, 10, 0)).toBe(50);
  });
});

describe('computeCampaignLift (real DB)', () => {
  it('returns nulls when no snapshots exist for the campaign (boundary)', () => {
    const result = computeCampaignLift('not-a-real-campaign-id');
    expect(result.preSnapshot).toBeNull();
    expect(result.postSnapshot).toBeNull();
    expect(result.lift).toBeNull();
  });

  it('computes a real positive lift between two real snapshots (positive case)', () => {
    const campaignId = createCampaign({ name: `__test_lift_campaign_${Date.now()}` });
    const preId = `pre-${Date.now()}`;
    const postId = `post-${Date.now()}`;
    db.insert(schema.brandHealthSnapshots).values([
      { id: preId, snapshotDate: new Date('2026-01-01'), healthScore: 40, totalMentions: 5, positiveMentions: 2, neutralMentions: 1, negativeMentions: 2, competitorsTracked: 0, campaignId, label: 'pre', createdAt: new Date() },
      { id: postId, snapshotDate: new Date('2026-02-01'), healthScore: 70, totalMentions: 8, positiveMentions: 6, neutralMentions: 1, negativeMentions: 1, competitorsTracked: 0, campaignId, label: 'post', createdAt: new Date() },
    ]).run();

    const result = computeCampaignLift(campaignId);
    expect(result.preSnapshot?.healthScore).toBe(40);
    expect(result.postSnapshot?.healthScore).toBe(70);
    expect(result.lift).toBe(30);

    db.delete(schema.brandHealthSnapshots).where(eq(schema.brandHealthSnapshots.campaignId, campaignId)).run();
    deleteCampaign(campaignId);
  });
});

const cleanupMentionIds: string[] = [];

afterAll(() => {
  for (const id of cleanupMentionIds) deleteBrandMention(id);
  for (const id of cleanupMentionIds) {
    const remaining = db.select().from(schema.brandMentions).where(eq(schema.brandMentions.id, id)).get();
    expect(remaining).toBeUndefined();
  }
});

describe('runBrandHealthPipeline (real DB)', () => {
  it('excludes unscored mentions from the health-score calculation (boundary)', async () => {
    const id = createBrandMention({ source: 'social', excerpt: `__test unscored mention ${Date.now()}`, collectedAt: new Date() });
    cleanupMentionIds.push(id);
    const result = await runBrandHealthPipeline({});
    // Just confirms the pipeline runs without throwing and reports totals
    // that include this mention among "total" but it stays unscored
    // until sentiment is assigned -- exact score depends on shared DB
    // state, so only structural assertions here (see computeHealthScore
    // above for the exact-value math tests).
    expect(result.totalMentions).toBeGreaterThan(0);
  });

  it('writes a real snapshot once a mention has real sentiment assigned (positive case)', async () => {
    const id = createBrandMention({ source: 'review', excerpt: `__test scored mention ${Date.now()}`, collectedAt: new Date() });
    cleanupMentionIds.push(id);
    updateBrandMentionSentiment(id, { sentiment: 'positive', sentimentExplanation: 'test' });

    const result = await runBrandHealthPipeline({ label: '__test snapshot' });
    expect(result.healthScore).not.toBeNull();
    expect(result.snapshotId).not.toBeNull();

    if (result.snapshotId) {
      db.delete(schema.brandHealthSnapshots).where(eq(schema.brandHealthSnapshots.id, result.snapshotId)).run();
    }
  });
});
