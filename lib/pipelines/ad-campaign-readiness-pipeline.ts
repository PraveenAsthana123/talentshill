import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getAdCampaignById } from '@/lib/db/ad-campaign-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface AdCampaignReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; campaignId: string | null }

// Real, deterministic readiness score for an ad campaign record. Does
// NOT sync real spend/impressions from any ad platform -- no platform
// API credentials exist for this build; disclosed in Governance.
//   objective + budget set                25
//   target audience defined                25
//   creative attached                      25
//   date range set, end after start        25
export async function runAdCampaignReadinessPipeline(params: { campaignId: string; triggeredBy?: string | null }): Promise<AdCampaignReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'ads_management', operationName: 'pipeline_campaign_readiness', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const campaign = getAdCampaignById(params.campaignId);
  if (!campaign) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'campaign not found' });
    return { runId, stages, score: 0, campaignId: null };
  }

  const objectiveScore = campaign.objective && campaign.budget && campaign.budget > 0 ? 25 : 0;
  stages.push({ stage: 'objective_budget_check', input: { objective: campaign.objective, budget: campaign.budget }, process: 'Score 25 if a real objective is set and budget > 0', output: objectiveScore, status: 'ok' });

  const audienceScore = campaign.targetAudience && campaign.targetAudience.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'target_audience_check', input: campaign.targetAudience, process: 'Score 25 if target audience is defined', output: audienceScore, status: 'ok' });

  const creativeScore = campaign.creativeUrl && campaign.creativeUrl.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'creative_attached_check', input: campaign.creativeUrl, process: 'Score 25 if a creative URL is attached', output: creativeScore, status: 'ok' });

  const datesValid = !!campaign.startDate && !!campaign.endDate && new Date(campaign.endDate) > new Date(campaign.startDate);
  const dateScore = datesValid ? 25 : 0;
  stages.push({ stage: 'date_range_check', input: { startDate: campaign.startDate, endDate: campaign.endDate }, process: 'Score 25 if start/end dates are both set and end is after start', output: dateScore, status: 'ok' });

  const totalScore = objectiveScore + audienceScore + creativeScore + dateScore;
  db.update(schema.adCampaigns).set({ readinessScore: totalScore }).where(eq(schema.adCampaigns.id, params.campaignId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update ad_campaigns.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, campaignId: params.campaignId };
}
