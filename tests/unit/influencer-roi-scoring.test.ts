import { describe, it, expect, afterAll } from 'vitest';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { createInfluencerCampaign, deleteInfluencerCampaign } from '@/lib/db/influencer-campaign-queries';
import { createInfluencerMetricEntry, getRoiAggregateForAllCampaigns, searchProspectingCreators } from '@/lib/db/influencer-campaign-metrics-queries';
import { classifyRenewalAction } from '@/lib/pipelines/influencer-roi-pipeline';

// Part 1: pure classification-rule tests, same lesson learned from
// ads_management -- a rank-dependent rule can't be reliably asserted
// against a shared dev DB, so test the exact function the pipeline calls
// with controlled idx/totalScored inputs.
const base = { campaignId: 'c1', influencerName: 'Test Creator', platform: 'instagram', agreedFee: 500, audienceFitScore: 80, totalRevenue: 0 };

describe('classifyRenewalAction (pure rule)', () => {
  it('recommends drop when ROI is negative (negative case)', () => {
    const result = classifyRenewalAction({ ...base, roi: -0.2, totalRevenue: 400 }, 0, 3);
    expect(result.action).toBe('drop');
  });
  it('recommends renew for the top-ranked creator with ROI >= 0 (positive case)', () => {
    const result = classifyRenewalAction({ ...base, roi: 2.5, totalRevenue: 1750 }, 0, 4);
    expect(result.action).toBe('renew');
  });
  it('recommends hold for a bottom-half creator with ROI >= 0 (negative case)', () => {
    const result = classifyRenewalAction({ ...base, roi: 0.1, totalRevenue: 550 }, 3, 4);
    expect(result.action).toBe('hold');
  });
  it('recommends renew for a single profitable creator, not hold (boundary: n=1)', () => {
    const result = classifyRenewalAction({ ...base, roi: 2.5, totalRevenue: 1750 }, 0, 1);
    expect(result.action).toBe('renew');
  });
  it('holds when ROI is null (no metrics/fee) (boundary)', () => {
    const result = classifyRenewalAction({ ...base, roi: null }, 0, 1);
    expect(result.action).toBe('hold');
  });
  it('treats ROI exactly 0 as break-even, not a loss (boundary)', () => {
    const result = classifyRenewalAction({ ...base, roi: 0, totalRevenue: 500 }, 0, 1);
    expect(result.action).not.toBe('drop');
  });
});

// Part 2: real DB aggregation + creator-search tests.
const createdIds: string[] = [];
function makeCampaign(name: string, extra: { audienceFitScore?: number } = {}) {
  const id = createInfluencerCampaign({ influencerName: name, platform: 'instagram', agreedFee: 500, ...extra });
  createdIds.push(id);
  return id;
}

afterAll(() => {
  for (const id of createdIds) {
    db.delete(schema.influencerCampaignMetrics).where(eq(schema.influencerCampaignMetrics.campaignId, id)).run();
    deleteInfluencerCampaign(id);
  }
  for (const id of createdIds) {
    const remaining = db.select().from(schema.influencerCampaigns).where(eq(schema.influencerCampaigns.id, id)).get();
    expect(remaining).toBeUndefined();
  }
});

describe('influencer ROI aggregation (real DB)', () => {
  it('excludes creators with zero metric entries from scoring (boundary)', () => {
    const id = makeCampaign(`__test_no_metrics_${Date.now()}`);
    const aggregate = getRoiAggregateForAllCampaigns().find((a) => a.campaignId === id);
    expect(aggregate?.entryCount).toBe(0);
    expect(aggregate?.roi).toBeNull();
  });

  it('computes ROI from real fee/revenue via SQL SUM (positive case)', () => {
    const id = makeCampaign(`__test_roi_${Date.now()}`);
    createInfluencerMetricEntry({ campaignId: id, recordedDate: new Date(), reach: 10000, clicks: 500, sales: 20, revenue: 1000 });
    const aggregate = getRoiAggregateForAllCampaigns().find((a) => a.campaignId === id);
    // (1000 - 500) / 500 = 1.0 (100% ROI)
    expect(aggregate?.roi).toBeCloseTo(1.0, 5);
  });

  it('excludes creators with an entry but no agreed fee from ROI scoring (boundary)', () => {
    const id = createInfluencerCampaign({ influencerName: `__test_no_fee_${Date.now()}`, platform: 'instagram' });
    createdIds.push(id);
    createInfluencerMetricEntry({ campaignId: id, recordedDate: new Date(), reach: 5000, clicks: 100, sales: 5, revenue: 300 });
    const aggregate = getRoiAggregateForAllCampaigns().find((a) => a.campaignId === id);
    expect(aggregate?.roi).toBeNull();
  });
});

describe('searchProspectingCreators (creator discovery)', () => {
  it('finds a real prospecting creator matching platform + min audience fit (positive case)', () => {
    const id = makeCampaign(`__test_search_${Date.now()}`, { audienceFitScore: 90 });
    const results = searchProspectingCreators({ platform: 'instagram', minAudienceFitScore: 80 });
    expect(results.some((r) => r.id === id)).toBe(true);
  });

  it('excludes a creator below the minimum audience fit threshold (negative case)', () => {
    const id = makeCampaign(`__test_lowfit_${Date.now()}`, { audienceFitScore: 30 });
    const results = searchProspectingCreators({ platform: 'instagram', minAudienceFitScore: 80 });
    expect(results.some((r) => r.id === id)).toBe(false);
  });
});
