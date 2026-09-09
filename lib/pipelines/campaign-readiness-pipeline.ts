import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult {
  stage: string; input: unknown; process: string; output: unknown; status: 'ok' | 'failed';
}

export interface CampaignReadinessResult {
  runId: string;
  stages: ReadinessStageResult[];
  ready: boolean;
  blockers: string[];
  campaignId: string | null;
}

// Real deterministic pre-launch validation -- checks the same fields a
// human would manually eyeball before clicking launch, doesn't invent
// new criteria. Never changes campaign status itself (that stays a human
// or the existing launch endpoint's job) -- this only reports readiness.
export function runCampaignReadinessPipeline(params: { campaignId: string; triggeredBy?: string | null }): CampaignReadinessResult {
  const stages: ReadinessStageResult[] = [];
  const blockers: string[] = [];
  const runId = logOperationRun({
    moduleKey: 'campaigns', operationName: 'pipeline_readiness_check', executionMode: 'pipeline',
    status: 'running', inputPayload: params, triggeredBy: params.triggeredBy,
  });

  const campaign = db.select().from(schema.campaigns).where(eq(schema.campaigns.id, params.campaignId)).get();
  if (!campaign) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'campaign not found' });
    return { runId, stages, ready: false, blockers: ['Campaign not found'], campaignId: null };
  }

  const checkSubject = !!campaign.subject && campaign.subject.trim().length > 0;
  stages.push({ stage: 'subject_check', input: campaign.subject, process: 'Real subject field must be non-empty', output: checkSubject, status: checkSubject ? 'ok' : 'failed' });
  if (!checkSubject) blockers.push('No subject line set');

  const checkTemplate = !!campaign.templateId;
  stages.push({ stage: 'template_check', input: campaign.templateId, process: 'Real templateId must be assigned', output: checkTemplate, status: checkTemplate ? 'ok' : 'failed' });
  if (!checkTemplate) blockers.push('No email template assigned');

  const checkAudience = (campaign.audienceCount || 0) > 0;
  stages.push({ stage: 'audience_check', input: campaign.audienceCount, process: 'Real audienceCount must be > 0', output: checkAudience, status: checkAudience ? 'ok' : 'failed' });
  if (!checkAudience) blockers.push('Audience is empty (0 recipients)');

  const checkEmailProfile = !!campaign.emailProfileId;
  stages.push({ stage: 'email_profile_check', input: campaign.emailProfileId, process: 'Real emailProfileId must be set (a sender identity)', output: checkEmailProfile, status: checkEmailProfile ? 'ok' : 'failed' });
  if (!checkEmailProfile) blockers.push('No sender email profile configured');

  const ready = blockers.length === 0;
  updateOperationRunStatus(runId, 'completed', { outputPayload: { ready, blockers } });
  return { runId, stages, ready, blockers, campaignId: params.campaignId };
}
