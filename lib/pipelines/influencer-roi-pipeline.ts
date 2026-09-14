import { getRoiAggregateForAllCampaigns, type CreatorRoiAggregate } from '@/lib/db/influencer-campaign-metrics-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface RoiStageResult {
  stage: string;
  input: unknown;
  process: string;
  output: unknown;
  status: 'ok';
}

export interface CreatorRenewalSuggestion {
  campaignId: string;
  influencerName: string;
  platform: string;
  agreedFee: number | null;
  audienceFitScore: number | null;
  roi: number | null;
  action: 'renew' | 'hold' | 'drop';
  reason: string;
}

export interface InfluencerRoiResult {
  runId: string;
  stages: RoiStageResult[];
  scoredCreators: number;
  unscoredCreators: number;
  suggestions: CreatorRenewalSuggestion[];
}

// Pure classification rule, tested in isolation (same lesson learned from
// the ads_management budget-optimization build: a rank-dependent rule
// tested against a shared, uncontrolled dev DB is flaky).
//
// Rule: ROI < 0 (fee exceeds revenue generated) -> drop. ROI >= 0 and
// ranked in the top half of scored creators (rank <= ceil(n/2), so a
// single profitable creator qualifies) -> renew. Everything else -> hold.
export function classifyRenewalAction(
  c: Pick<CreatorRoiAggregate, 'campaignId' | 'influencerName' | 'platform' | 'agreedFee' | 'audienceFitScore' | 'roi' | 'totalRevenue'>,
  idx: number,
  totalScored: number,
): CreatorRenewalSuggestion {
  const topHalfCutoff = Math.floor((totalScored - 1) / 2);
  if (c.roi !== null && c.roi < 0) {
    return {
      campaignId: c.campaignId, influencerName: c.influencerName, platform: c.platform, agreedFee: c.agreedFee, audienceFitScore: c.audienceFitScore,
      roi: c.roi, action: 'drop',
      reason: `ROI ${(c.roi * 100).toFixed(0)}% -- revenue of $${c.totalRevenue.toFixed(2)} did not cover the $${(c.agreedFee ?? 0).toFixed(2)} fee`,
    };
  }
  if (c.roi !== null && c.roi >= 0 && idx <= topHalfCutoff) {
    return {
      campaignId: c.campaignId, influencerName: c.influencerName, platform: c.platform, agreedFee: c.agreedFee, audienceFitScore: c.audienceFitScore,
      roi: c.roi, action: 'renew',
      reason: `ROI ${(c.roi * 100).toFixed(0)}% is in the top half of scored creators (rank ${idx + 1} of ${totalScored})`,
    };
  }
  return {
    campaignId: c.campaignId, influencerName: c.influencerName, platform: c.platform, agreedFee: c.agreedFee, audienceFitScore: c.audienceFitScore,
    roi: c.roi, action: 'hold',
    reason: c.roi === null ? 'No logged metrics or no agreed fee yet' : `ROI ${(c.roi * 100).toFixed(0)}% is positive but in the bottom half`,
  };
}

// Deterministic, no LLM. Real SQL-aggregated metrics only -- creators
// with zero metric entries or no agreedFee are excluded from ranking.
export async function runInfluencerRoiPipeline(params: { triggeredBy?: string | null }): Promise<InfluencerRoiResult> {
  const stages: RoiStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'influencer_video',
    operationName: 'pipeline_roi_scoring',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const all = getRoiAggregateForAllCampaigns();
  const scored = all.filter((c) => c.roi !== null);
  const unscored = all.filter((c) => c.roi === null);

  stages.push({
    stage: 'fetch_roi_aggregates',
    input: { totalCreators: all.length },
    process: 'SUM real influencer_campaign_metrics rows per creator; exclude creators with no metrics or no agreed fee',
    output: { scored: scored.length, unscored: unscored.length },
    status: 'ok',
  });

  const ranked = [...scored].sort((a, b) => (b.roi ?? -Infinity) - (a.roi ?? -Infinity));
  stages.push({
    stage: 'rank_by_roi',
    input: { count: ranked.length },
    process: 'Sort scored creators descending by ROI ((revenue - fee) / fee)',
    output: ranked.map((c) => ({ campaignId: c.campaignId, influencerName: c.influencerName, roi: c.roi })),
    status: 'ok',
  });

  const suggestions = ranked.map((c, idx) => classifyRenewalAction(c, idx, ranked.length));
  stages.push({
    stage: 'compute_renewal_suggestions',
    input: { rule: 'ROI<0 -> drop, top half ROI>=0 -> renew, else hold' },
    process: 'Apply the disclosed deterministic rule per creator',
    output: suggestions,
    status: 'ok',
  });

  updateOperationRunStatus(runId, 'completed', {
    outputPayload: { scoredCreators: scored.length, unscoredCreators: unscored.length, suggestionCount: suggestions.length },
  });

  return { runId, stages, scoredCreators: scored.length, unscoredCreators: unscored.length, suggestions };
}
