import { describe, it, expect, afterAll } from 'vitest';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { createAdCampaign, deleteAdCampaign } from '@/lib/db/ad-campaign-queries';
import { createAdCampaignMetricEntry, getAggregatedMetricsForAllCampaigns } from '@/lib/db/ad-campaign-metrics-queries';
import { classifyBudgetAction } from '@/lib/pipelines/ad-budget-optimization-pipeline';

// Part 1: pure classification-rule tests. Deliberately NOT run against
// the live DB -- a rank-dependent rule ("top half of N campaigns")
// cannot be asserted reliably against a shared dev database that may
// already contain other real campaigns, so the rule itself is tested as
// a pure function instead. This is real production logic, not a mock --
// classifyBudgetAction is the exact function the pipeline calls.
const baseCampaign = { campaignId: 'c1', name: 'Test Campaign', platform: 'google', budget: 1000, cpa: 20, totalSpend: 200, totalRevenue: 0 };

describe('classifyBudgetAction (pure rule)', () => {
  it('recommends decrease when ROAS is below 1.0 (negative case)', () => {
    const result = classifyBudgetAction({ ...baseCampaign, roas: 0.2, totalRevenue: 40 }, 0, 3);
    expect(result.action).toBe('decrease');
    expect(result.suggestedDeltaPct).toBe(-20);
  });

  it('recommends increase for the top-ranked campaign with ROAS >= 1.0 (positive case)', () => {
    const result = classifyBudgetAction({ ...baseCampaign, roas: 4.5, totalRevenue: 900 }, 0, 4);
    expect(result.action).toBe('increase');
    expect(result.suggestedDeltaPct).toBe(15);
  });

  it('recommends hold for a bottom-half campaign with ROAS >= 1.0 (negative case)', () => {
    // 4 scored campaigns, topHalfCutoff = floor(3/2) = 1 -> ranks 0,1 qualify; rank 3 does not
    const result = classifyBudgetAction({ ...baseCampaign, roas: 1.1, totalRevenue: 220 }, 3, 4);
    expect(result.action).toBe('hold');
    expect(result.suggestedDeltaPct).toBe(0);
  });

  it('recommends increase for a single profitable campaign, not hold (boundary: n=1)', () => {
    const result = classifyBudgetAction({ ...baseCampaign, roas: 4.5, totalRevenue: 900 }, 0, 1);
    expect(result.action).toBe('increase');
  });

  it('recommends hold when ROAS is exactly null (boundary: no spend recorded)', () => {
    const result = classifyBudgetAction({ ...baseCampaign, roas: null, totalRevenue: 0 }, 0, 1);
    expect(result.action).toBe('hold');
    expect(result.reason).toContain('No spend recorded');
  });

  it('treats ROAS exactly 1.0 as break-even, not a loss (boundary)', () => {
    const result = classifyBudgetAction({ ...baseCampaign, roas: 1.0, totalRevenue: 200 }, 0, 1);
    expect(result.action).not.toBe('decrease');
  });
});

// Part 2: real DB aggregation tests -- verifies the SQL SUM/exclusion
// logic against real inserted rows. Every campaign created here is
// deleted in afterAll and its absence verified by direct query, same
// convention as docs/testing/2026-09-09_e2e-test-evidence.md.
const createdCampaignIds: string[] = [];

function makeCampaign(name: string) {
  const id = createAdCampaign({ name, platform: 'google', budget: 1000 });
  createdCampaignIds.push(id);
  return id;
}

afterAll(() => {
  for (const id of createdCampaignIds) {
    db.delete(schema.adCampaignMetrics).where(eq(schema.adCampaignMetrics.campaignId, id)).run();
    deleteAdCampaign(id);
  }
  for (const id of createdCampaignIds) {
    const remaining = db.select().from(schema.adCampaigns).where(eq(schema.adCampaigns.id, id)).get();
    expect(remaining).toBeUndefined();
  }
});

describe('Ad campaign metrics aggregation (real DB)', () => {
  it('excludes campaigns with zero metric entries from scoring (boundary)', () => {
    const id = makeCampaign(`__test_no_metrics_${Date.now()}`);
    const aggregate = getAggregatedMetricsForAllCampaigns().find((a) => a.campaignId === id);
    expect(aggregate?.entryCount).toBe(0);
    expect(aggregate?.roas).toBeNull();
  });

  it('computes ROAS from real spend/revenue via SQL SUM for one entry (positive case)', () => {
    const id = makeCampaign(`__test_single_entry_${Date.now()}`);
    createAdCampaignMetricEntry({ campaignId: id, recordedDate: new Date(), impressions: 1000, clicks: 50, conversions: 2, revenue: 40, spendForPeriod: 200 });
    const aggregate = getAggregatedMetricsForAllCampaigns().find((a) => a.campaignId === id);
    expect(aggregate?.roas).toBeCloseTo(40 / 200, 5);
    expect(aggregate?.cpa).toBeCloseTo(200 / 2, 5);
  });

  it('aggregates multiple metric entries for the same campaign via real SQL SUM (positive case)', () => {
    const id = makeCampaign(`__test_multi_entry_${Date.now()}`);
    createAdCampaignMetricEntry({ campaignId: id, recordedDate: new Date('2026-01-01'), impressions: 500, clicks: 20, conversions: 1, revenue: 100, spendForPeriod: 50 });
    createAdCampaignMetricEntry({ campaignId: id, recordedDate: new Date('2026-01-02'), impressions: 500, clicks: 20, conversions: 1, revenue: 100, spendForPeriod: 50 });
    const aggregate = getAggregatedMetricsForAllCampaigns().find((a) => a.campaignId === id);
    expect(aggregate?.entryCount).toBe(2);
    expect(aggregate?.totalImpressions).toBe(1000);
    expect(aggregate?.totalRevenue).toBe(200);
    expect(aggregate?.totalSpend).toBe(100);
    expect(aggregate?.roas).toBeCloseTo(2, 5);
  });
});
