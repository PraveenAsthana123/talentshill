import { describe, it, expect, afterAll } from 'vitest';
import { computeOpportunityScore, rankByScore, runMarketOpportunityScoringPipeline } from '@/lib/pipelines/market-opportunity-scoring-pipeline';
import { createMarketResearchBrief, deleteMarketResearchBrief, updateMarketResearchBrief } from '@/lib/db/market-research-queries';

describe('computeOpportunityScore (pure)', () => {
  it('scores the maximum 100 for a large SOM, low competition, low risk, perfect strategic fit (positive case)', () => {
    const result = computeOpportunityScore({ somEstimateUsd: 5_000_000, competitionLevel: 'low', riskLevel: 'low', strategicFitScore: 100 });
    expect(result.somScore).toBe(40);
    expect(result.competitionScore).toBe(30);
    expect(result.riskScore).toBe(15);
    expect(result.strategicFitContribution).toBe(15);
    expect(result.total).toBe(100);
  });

  it('scores the minimum 0 for a tiny SOM, high competition, high risk, zero strategic fit (negative case)', () => {
    const result = computeOpportunityScore({ somEstimateUsd: 0, competitionLevel: 'high', riskLevel: 'high', strategicFitScore: 0 });
    expect(result.total).toBe(0);
  });

  it('buckets SOM at each tier boundary exactly (boundary)', () => {
    const base = { competitionLevel: 'medium' as const, riskLevel: 'medium' as const, strategicFitScore: 0 };
    expect(computeOpportunityScore({ ...base, somEstimateUsd: 9_999 }).somScore).toBe(0);
    expect(computeOpportunityScore({ ...base, somEstimateUsd: 10_000 }).somScore).toBe(10);
    expect(computeOpportunityScore({ ...base, somEstimateUsd: 99_999 }).somScore).toBe(10);
    expect(computeOpportunityScore({ ...base, somEstimateUsd: 100_000 }).somScore).toBe(25);
    expect(computeOpportunityScore({ ...base, somEstimateUsd: 999_999 }).somScore).toBe(25);
    expect(computeOpportunityScore({ ...base, somEstimateUsd: 1_000_000 }).somScore).toBe(40);
  });

  it('clamps a strategic fit input outside 0-100 rather than producing an out-of-range contribution (boundary)', () => {
    const result = computeOpportunityScore({ somEstimateUsd: 0, competitionLevel: 'high', riskLevel: 'high', strategicFitScore: 150 });
    expect(result.strategicFitContribution).toBe(15);
  });
});

describe('rankByScore (pure)', () => {
  it('assigns dense ranks with ties sharing the same rank (boundary)', () => {
    const ranked = rankByScore([
      { id: 'a', score: 90 },
      { id: 'b', score: 90 },
      { id: 'c', score: 70 },
      { id: 'd', score: 50 },
    ]);
    expect(ranked.find((r) => r.id === 'a')?.rank).toBe(1);
    expect(ranked.find((r) => r.id === 'b')?.rank).toBe(1);
    expect(ranked.find((r) => r.id === 'c')?.rank).toBe(3);
    expect(ranked.find((r) => r.id === 'd')?.rank).toBe(4);
  });

  it('ranks a single item as #1 (positive case)', () => {
    const ranked = rankByScore([{ id: 'only', score: 42 }]);
    expect(ranked).toEqual([{ id: 'only', rank: 1 }]);
  });

  it('handles an empty list without throwing (negative case)', () => {
    expect(rankByScore([])).toEqual([]);
  });
});

const cleanupBriefIds: string[] = [];

afterAll(() => {
  for (const id of cleanupBriefIds) deleteMarketResearchBrief(id);
});

describe('runMarketOpportunityScoringPipeline (real DB)', () => {
  it('skips briefs missing any real opportunity-scoring input (negative case)', async () => {
    const id = createMarketResearchBrief({ title: `__test incomplete brief ${Date.now()}`, topic: 'incomplete inputs test' });
    cleanupBriefIds.push(id);

    const result = await runMarketOpportunityScoringPipeline({});
    expect(result.ranked.find((r) => r.id === id)).toBeUndefined();
  });

  it('scores and ranks a brief with complete real inputs, writing score+rank back to the row (positive case)', async () => {
    const id = createMarketResearchBrief({ title: `__test complete brief ${Date.now()}`, topic: 'complete inputs test' });
    cleanupBriefIds.push(id);
    updateMarketResearchBrief(id, { somEstimateUsd: 2_000_000, competitionLevel: 'low', riskLevel: 'low', strategicFitScore: 100 });

    const result = await runMarketOpportunityScoringPipeline({});
    const scoredBrief = result.ranked.find((r) => r.id === id);
    expect(scoredBrief).toBeDefined();
    expect(scoredBrief?.opportunityScore).toBe(100);
    expect(scoredBrief?.opportunityRank).toBe(1);
  });
});
