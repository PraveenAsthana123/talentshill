import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getInfluencerCampaignById } from '@/lib/db/influencer-campaign-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface InfluencerCampaignReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; campaignId: string | null }

// Real, deterministic readiness score.
//   contact email present                              25
//   deliverables defined                                25
//   agreed fee set once status is active/completed      25 (n/a otherwise)
//   status has progressed past prospecting              25
export async function runInfluencerCampaignReadinessPipeline(params: { campaignId: string; triggeredBy?: string | null }): Promise<InfluencerCampaignReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'influencer_video', operationName: 'pipeline_campaign_readiness', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const campaign = getInfluencerCampaignById(params.campaignId);
  if (!campaign) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'campaign not found' });
    return { runId, stages, score: 0, campaignId: null };
  }

  const contactScore = campaign.contactEmail && campaign.contactEmail.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'contact_email_check', input: !!campaign.contactEmail, process: 'Score 25 if a real contact email is present', output: contactScore, status: 'ok' });

  const deliverablesScore = campaign.deliverables && campaign.deliverables.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'deliverables_check', input: !!campaign.deliverables, process: 'Score 25 if deliverables are defined', output: deliverablesScore, status: 'ok' });

  const needsFee = campaign.status === 'active' || campaign.status === 'completed';
  const feeScore = !needsFee || (campaign.agreedFee !== null && campaign.agreedFee !== undefined && campaign.agreedFee > 0) ? 25 : 0;
  stages.push({ stage: 'agreed_fee_check', input: { status: campaign.status, agreedFee: campaign.agreedFee }, process: 'Score 25 if agreed fee is set once status is active/completed, or n/a-pass otherwise', output: feeScore, status: 'ok' });

  const progressScore = campaign.status !== 'prospecting' ? 25 : 0;
  stages.push({ stage: 'status_progress_check', input: campaign.status, process: "Score 25 if status has progressed past 'prospecting'", output: progressScore, status: 'ok' });

  const totalScore = contactScore + deliverablesScore + feeScore + progressScore;
  db.update(schema.influencerCampaigns).set({ readinessScore: totalScore }).where(eq(schema.influencerCampaigns.id, params.campaignId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update influencer_campaigns.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, campaignId: params.campaignId };
}
