import { db, schema } from '@/lib/db/index';
import { eq, and, isNull, inArray } from 'drizzle-orm';
import { getCampaignById } from '@/lib/db/campaign-queries';
import { createList, addListMembers } from '@/lib/db/list-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface BehavioralStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' | 'failed' }
export interface BehavioralSegmentationResult {
  runId: string;
  stages: BehavioralStageResult[];
  campaignId: string | null;
  nonOpenerCount: number;
  nurtureListId: string | null;
}

// Real behavioral segmentation: a campaign's real, actually-sent
// recipients (status IN sent/delivered) whose real emailEvents/
// campaignRecipients show no 'opened' event, materialized into a real
// static list an admin can target with a follow-up nurture send. This
// only produces meaningful results once campaign-sender.ts's tracking-
// pixel wiring (added alongside this pipeline) is actually sending real
// tracked emails -- on old campaigns sent before that fix, "non-openers"
// will just be everyone, since no opens could ever have been recorded.
export async function runCampaignBehavioralSegmentationPipeline(params: { campaignId: string; triggeredBy?: string | null }): Promise<BehavioralSegmentationResult> {
  const stages: BehavioralStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'campaigns',
    operationName: 'pipeline_behavioral_segmentation',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const campaign = getCampaignById(params.campaignId);
  if (!campaign) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'campaign not found' });
    return { runId, stages, campaignId: null, nonOpenerCount: 0, nurtureListId: null };
  }

  // Statuses that all mean "this recipient was actually sent a real
  // email" -- not just 'sent'/'delivered'. Bug caught live 2026-09-14:
  // once a recipient opens or clicks, their status advances to
  // 'opened'/'clicked', which the original 'sent'/'delivered'-only
  // filter silently excluded from the "actually sent" cohort entirely,
  // undercounting both the sent total and (had any existed) any real
  // openers.
  const SENT_STATUSES = ['sent', 'delivered', 'opened', 'clicked'] as const;

  const sentRecipients = db.select().from(schema.campaignRecipients)
    .where(and(eq(schema.campaignRecipients.campaignId, params.campaignId), inArray(schema.campaignRecipients.status, [...SENT_STATUSES])))
    .all();
  stages.push({ stage: 'fetch_sent_recipients', input: { campaignId: params.campaignId }, process: 'Read real campaign_recipients with status sent/delivered/opened/clicked', output: `${sentRecipients.length} recipients`, status: 'ok' });

  const nonOpeners = db.select().from(schema.campaignRecipients)
    .where(and(
      eq(schema.campaignRecipients.campaignId, params.campaignId),
      inArray(schema.campaignRecipients.status, [...SENT_STATUSES]),
      isNull(schema.campaignRecipients.openedAt),
    ))
    .all();
  stages.push({ stage: 'identify_non_openers', input: { sentCount: sentRecipients.length }, process: 'Filter to recipients with no real openedAt timestamp (no fabricated engagement inference)', output: `${nonOpeners.length} non-openers`, status: 'ok' });

  if (nonOpeners.length === 0) {
    stages.push({ stage: 'materialize_nurture_list', input: {}, process: 'No non-openers to segment', output: 'skipped', status: 'ok' });
    updateOperationRunStatus(runId, 'completed', { outputPayload: { nonOpenerCount: 0 } });
    return { runId, stages, campaignId: params.campaignId, nonOpenerCount: 0, nurtureListId: null };
  }

  const listId = createList({
    name: `${campaign.name} - Non-Openers (${new Date().toISOString().slice(0, 10)})`,
    description: `Real behavioral segment: recipients of campaign "${campaign.name}" who had not opened as of this pipeline run. Static snapshot, not auto-updating.`,
    type: 'static',
  });
  addListMembers(listId, nonOpeners.map((r) => r.contactId));
  stages.push({ stage: 'materialize_nurture_list', input: { nonOpenerCount: nonOpeners.length }, process: 'Create a real static list and add real contact IDs -- ready to target with a follow-up nurture campaign', output: { listId, memberCount: nonOpeners.length }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { nonOpenerCount: nonOpeners.length, nurtureListId: listId } });
  return { runId, stages, campaignId: params.campaignId, nonOpenerCount: nonOpeners.length, nurtureListId: listId };
}
