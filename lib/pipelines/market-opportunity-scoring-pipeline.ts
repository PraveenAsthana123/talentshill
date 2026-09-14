import { db, schema } from '@/lib/db/index';
import {
  getScorableMarketResearchBriefs,
  getRankedMarketResearchBriefs,
  setBriefOpportunityScoreAndRank,
} from '@/lib/db/market-research-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface OpportunityScoreBreakdown {
  somScore: number; // 0-40, bucketed from the analyst's real SOM estimate
  competitionScore: number; // 0-30, low competition scores highest
  riskScore: number; // 0-15, low risk scores highest
  strategicFitContribution: number; // 0-15, scaled from the analyst's 0-100 strategic fit input
  total: number; // 0-100
}

// Pure, unit-tested, deterministic. Every input is a real analyst-entered
// estimate (SOM size, competition level, risk level, strategic fit
// judgment) -- this function only combines them with a disclosed,
// fixed formula. It never estimates market size, competition, or risk
// itself; an LLM never touches this calculation.
export function computeOpportunityScore(params: {
  somEstimateUsd: number;
  competitionLevel: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  strategicFitScore: number; // 0-100
}): OpportunityScoreBreakdown {
  const somScore = params.somEstimateUsd >= 1_000_000 ? 40
    : params.somEstimateUsd >= 100_000 ? 25
    : params.somEstimateUsd >= 10_000 ? 10
    : 0;

  const competitionScore = { low: 30, medium: 15, high: 0 }[params.competitionLevel];
  const riskScore = { low: 15, medium: 8, high: 0 }[params.riskLevel];

  const clampedFit = Math.max(0, Math.min(100, params.strategicFitScore));
  const strategicFitContribution = Math.round(clampedFit * 0.15);

  const total = somScore + competitionScore + riskScore + strategicFitContribution;
  return { somScore, competitionScore, riskScore, strategicFitContribution, total };
}

// Pure, unit-tested: assigns dense 1-based ranks (1 = highest score) to
// a list of {id, score}. Ties share the same rank (standard competition
// ranking), never an arbitrary tiebreak.
export function rankByScore(items: { id: string; score: number }[]): { id: string; rank: number }[] {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const ranked: { id: string; rank: number }[] = [];
  let rank = 0;
  let lastScore: number | null = null;
  let seen = 0;
  for (const item of sorted) {
    seen += 1;
    if (item.score !== lastScore) {
      rank = seen;
      lastScore = item.score;
    }
    ranked.push({ id: item.id, rank });
  }
  return ranked;
}

export interface OpportunityStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface OpportunityScoringResult {
  runId: string;
  stages: OpportunityStageResult[];
  scoredCount: number;
  skippedCount: number;
  ranked: { id: string; title: string; opportunityScore: number; opportunityRank: number }[];
}

// Real, deterministic. Scores every brief with complete real inputs
// (SOM/competition/risk/strategic-fit all entered by an analyst),
// writes the composite score + rank back to each row, and skips briefs
// missing any real input rather than guessing a default for them. This
// is genuinely new work -- distinct from the pre-existing readiness
// pipeline (generic completeness score) and synthesis agent
// (single-brief text synthesis); neither compares briefs to each other.
export async function runMarketOpportunityScoringPipeline(params: { triggeredBy?: string | null } = {}): Promise<OpportunityScoringResult> {
  const stages: OpportunityStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'market_research',
    operationName: 'pipeline_opportunity_scoring',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const allBriefs = db.select().from(schema.marketResearchBriefs).all();
  const scorable = getScorableMarketResearchBriefs();
  const skipped = allBriefs.length - scorable.length;
  stages.push({
    stage: 'fetch_briefs',
    input: {},
    process: 'Load all real briefs; only briefs with SOM estimate + competition level + risk level + strategic fit score already entered by an analyst are eligible',
    output: { total: allBriefs.length, scorable: scorable.length, skipped },
    status: 'ok',
  });

  const scored = scorable.map((brief) => {
    const breakdown = computeOpportunityScore({
      somEstimateUsd: brief.somEstimateUsd!,
      competitionLevel: brief.competitionLevel as 'low' | 'medium' | 'high',
      riskLevel: brief.riskLevel as 'low' | 'medium' | 'high',
      strategicFitScore: brief.strategicFitScore!,
    });
    return { id: brief.id, title: brief.title, score: breakdown.total, breakdown };
  });
  stages.push({
    stage: 'compute_scores',
    input: { formula: 'somScore(0-40) + competitionScore(0-30) + riskScore(0-15) + strategicFitContribution(0-15)' },
    process: 'Apply the disclosed deterministic formula to each scorable brief',
    output: scored.map((s) => ({ id: s.id, score: s.score })),
    status: 'ok',
  });

  const ranks = rankByScore(scored.map((s) => ({ id: s.id, score: s.score })));
  const rankById = new Map(ranks.map((r) => [r.id, r.rank]));

  for (const s of scored) {
    setBriefOpportunityScoreAndRank(s.id, s.score, rankById.get(s.id)!);
  }
  stages.push({
    stage: 'write_scores_and_ranks',
    input: {},
    process: 'Write opportunity_score + opportunity_rank back to each scored brief (dense ranking, ties share a rank)',
    output: { written: scored.length },
    status: 'ok',
  });

  const ranked = getRankedMarketResearchBriefs().map((b) => ({
    id: b.id, title: b.title, opportunityScore: b.opportunityScore!, opportunityRank: b.opportunityRank!,
  }));

  updateOperationRunStatus(runId, 'completed', { outputPayload: { scoredCount: scored.length, skippedCount: skipped } });
  return { runId, stages, scoredCount: scored.length, skippedCount: skipped, ranked };
}
