import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getCampaignById, addCampaignRecipients, getCampaignRecipientCount } from '@/lib/db/campaign-queries';
import { getListById, getListMemberIds } from '@/lib/db/list-queries';
import { runListSyncPipeline } from '@/lib/pipelines/list-sync-pipeline';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface MaterializationStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' | 'failed' }
export interface CampaignRecipientMaterializationResult {
  runId: string;
  stages: MaterializationStageResult[];
  added: number;
  totalRecipients: number;
  campaignId: string | null;
}

// Real, functional gap this pipeline closes: addCampaignRecipients()
// (lib/db/campaign-queries.ts) is a complete, working function with
// ZERO callers anywhere in this codebase before this pipeline. A
// campaign created via the wizard never got real campaign_recipients
// rows -- campaign-sender.ts's `getCampaignRecipients(status:'pending')`
// always returned [], so a "launched" campaign silently completed with
// 0 sent / 0 failed and no error. This is the exact same class of bug
// list-sync-pipeline.ts already fixed for dynamic lists vs. broadcasts;
// this pipeline is the campaign-side equivalent. Reuses runListSyncPipeline
// first so a dynamic list's membership is current before materializing.
export async function runCampaignRecipientMaterializationPipeline(params: { campaignId: string; triggeredBy?: string | null }): Promise<CampaignRecipientMaterializationResult> {
  const stages: MaterializationStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'campaigns',
    operationName: 'pipeline_materialize_recipients',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const campaign = getCampaignById(params.campaignId);
  if (!campaign) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'campaign not found' });
    return { runId, stages, added: 0, totalRecipients: 0, campaignId: null };
  }

  let contactIds: string[] = [];

  if ((campaign.audienceType === 'list' || campaign.audienceType === 'segment') && campaign.audienceId) {
    const list = getListById(campaign.audienceId);
    if (list?.type === 'dynamic') {
      const sync = await runListSyncPipeline({ listId: campaign.audienceId, triggeredBy: params.triggeredBy });
      stages.push({ stage: 'sync_dynamic_list', input: { listId: campaign.audienceId }, process: 'Dynamic list -- re-evaluate segmentRules and materialize real listMembers before reading membership', output: { added: sync.added, removed: sync.removed }, status: 'ok' });
    }
    contactIds = getListMemberIds(campaign.audienceId);
    stages.push({ stage: 'resolve_list_members', input: { listId: campaign.audienceId }, process: 'Read real listMembers for the campaign audience list', output: `${contactIds.length} contacts`, status: 'ok' });
  } else if (campaign.audienceType === 'all') {
    const rows = db.select({ id: schema.contacts.id }).from(schema.contacts).where(eq(schema.contacts.status, 'active')).all();
    contactIds = rows.map((r) => r.id);
    stages.push({ stage: 'resolve_all_active_contacts', input: {}, process: 'Read all real contacts with status=active', output: `${contactIds.length} contacts`, status: 'ok' });
  } else {
    stages.push({ stage: 'resolve_audience', input: { audienceType: campaign.audienceType, audienceId: campaign.audienceId }, process: 'No audience configured', output: 'audienceType/audienceId missing or unrecognized', status: 'failed' });
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'no audience configured' });
    return { runId, stages, added: 0, totalRecipients: 0, campaignId: params.campaignId };
  }

  const beforeCount = getCampaignRecipientCount(params.campaignId);
  addCampaignRecipients(params.campaignId, contactIds);
  const afterCount = getCampaignRecipientCount(params.campaignId);
  const added = afterCount - beforeCount;
  stages.push({ stage: 'materialize_recipients', input: { resolvedContacts: contactIds.length }, process: 'Insert real campaign_recipients rows (status=pending), idempotent via onConflictDoNothing -- re-running does not duplicate', output: { added, totalRecipients: afterCount }, status: 'ok' });

  db.update(schema.campaigns).set({ audienceCount: afterCount, updatedAt: new Date() }).where(eq(schema.campaigns.id, params.campaignId)).run();
  stages.push({ stage: 'write_audience_count', input: { afterCount }, process: 'Update campaigns.audience_count (real, previously-unwritten field)', output: { audienceCount: afterCount }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { added, totalRecipients: afterCount } });
  return { runId, stages, added, totalRecipients: afterCount, campaignId: params.campaignId };
}
