import { getAggregatedMetricsForAllCampaigns, type CampaignAggregate } from '@/lib/db/ad-campaign-metrics-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface OptimizationStageResult {
  stage: string;
  input: unknown;
  process: string;
  output: unknown;
  status: 'ok';
}

export interface BudgetReallocationSuggestion {
  campaignId: string;
  name: string;
  platform: string;
  currentBudget: number | null;
  roas: number | null;
  cpa: number | null;
  action: 'increase' | 'decrease' | 'hold';
  suggestedDeltaPct: number;
  reason: string;
}

export interface AdBudgetOptimizationResult {
  runId: string;
  stages: OptimizationStageResult[];
  scoredCampaigns: number;
  unscoredCampaigns: number;
  suggestions: BudgetReallocationSuggestion[];
}

// Pure classification rule, exported and unit-tested in isolation from
// the DB (see tests/unit/ad-budget-optimization.test.ts) so assertions
// don't depend on how many other campaigns happen to exist in the shared
// dev database at test time.
//
// Rule (disclosed, not hidden): ROAS < 1 (spend exceeds revenue) ->
// decrease 20%. ROAS >= 1 and ranked in the top half of scored campaigns
// (rank <= ceil(n/2), so a single profitable campaign IS its own top
// half) -> increase 15%. Everything else -> hold.
export function classifyBudgetAction(
  c: Pick<CampaignAggregate, 'campaignId' | 'name' | 'platform' | 'budget' | 'roas' | 'cpa' | 'totalSpend' | 'totalRevenue'>,
  idx: number,
  totalScored: number,
): BudgetReallocationSuggestion {
  const topHalfCutoff = Math.floor((totalScored - 1) / 2);
  if (c.roas !== null && c.roas < 1) {
    return {
      campaignId: c.campaignId, name: c.name, platform: c.platform, currentBudget: c.budget,
      roas: c.roas, cpa: c.cpa, action: 'decrease', suggestedDeltaPct: -20,
      reason: `ROAS ${c.roas.toFixed(2)} is below 1.0 -- spend of $${c.totalSpend.toFixed(2)} exceeds revenue of $${c.totalRevenue.toFixed(2)}`,
    };
  }
  if (c.roas !== null && c.roas >= 1 && idx <= topHalfCutoff) {
    return {
      campaignId: c.campaignId, name: c.name, platform: c.platform, currentBudget: c.budget,
      roas: c.roas, cpa: c.cpa, action: 'increase', suggestedDeltaPct: 15,
      reason: `ROAS ${c.roas.toFixed(2)} is in the top half of scored campaigns (rank ${idx + 1} of ${totalScored})`,
    };
  }
  return {
    campaignId: c.campaignId, name: c.name, platform: c.platform, currentBudget: c.budget,
    roas: c.roas, cpa: c.cpa, action: 'hold', suggestedDeltaPct: 0,
    reason: c.roas === null ? 'No spend recorded yet' : `ROAS ${c.roas.toFixed(2)} is in the bottom half but not losing money`,
  };
}

// Deterministic, no LLM. Real SQL-aggregated metrics only -- campaigns
// with zero manually-entered metric rows are excluded from ranking and
// reported separately (never given a fabricated ROAS/CPA).
export async function runAdBudgetOptimizationPipeline(params: { triggeredBy?: string | null }): Promise<AdBudgetOptimizationResult> {
  const stages: OptimizationStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'ads_management',
    operationName: 'pipeline_budget_optimization',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const all = getAggregatedMetricsForAllCampaigns();
  const scored = all.filter((c) => c.entryCount > 0);
  const unscored = all.filter((c) => c.entryCount === 0);

  stages.push({
    stage: 'fetch_aggregated_metrics',
    input: { totalCampaigns: all.length },
    process: 'SUM real ad_campaign_metrics rows per campaign; campaigns with zero rows are excluded from ranking',
    output: { scored: scored.length, unscored: unscored.length },
    status: 'ok',
  });

  const ranked = [...scored].sort((a, b) => (b.roas ?? -Infinity) - (a.roas ?? -Infinity));

  stages.push({
    stage: 'rank_by_roas',
    input: { count: ranked.length },
    process: 'Sort scored campaigns descending by ROAS (revenue / spend)',
    output: ranked.map((c) => ({ campaignId: c.campaignId, name: c.name, roas: c.roas })),
    status: 'ok',
  });

  const suggestions: BudgetReallocationSuggestion[] = ranked.map((c: CampaignAggregate, idx: number) => classifyBudgetAction(c, idx, ranked.length));

  stages.push({
    stage: 'compute_reallocation_suggestions',
    input: { rule: 'ROAS<1 -> -20%, top half (rank<=ceil(n/2)) with ROAS>=1 -> +15%, else hold' },
    process: 'Apply the disclosed deterministic rule per campaign',
    output: suggestions,
    status: 'ok',
  });

  updateOperationRunStatus(runId, 'completed', {
    outputPayload: { scoredCampaigns: scored.length, unscoredCampaigns: unscored.length, suggestionCount: suggestions.length },
  });

  return { runId, stages, scoredCampaigns: scored.length, unscoredCampaigns: unscored.length, suggestions };
}
