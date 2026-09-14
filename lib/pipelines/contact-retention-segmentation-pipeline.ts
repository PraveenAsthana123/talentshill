import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { createList, addListMembers } from '@/lib/db/list-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface RetentionStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface RetentionSegmentationResult {
  runId: string;
  stages: RetentionStageResult[];
  atRiskCount: number;
  retentionListId: string | null;
}

// Materializes real 'at_risk' contacts (per the real lifecycleStage
// already written by contact-activation-pipeline.ts) into a real static
// list, ready to target with a retention campaign -- reuses the same
// list infrastructure as campaign-behavioral-segmentation-pipeline.ts's
// nurture list, not a new mechanism. Run the activation pipeline first;
// this reads whatever lifecycleStage is currently stored, it does not
// recompute it.
export async function runContactRetentionSegmentationPipeline(params: { triggeredBy?: string | null }): Promise<RetentionSegmentationResult> {
  const stages: RetentionStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'contacts',
    operationName: 'pipeline_retention_segmentation',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const atRiskContacts = db.select().from(schema.contacts).where(eq(schema.contacts.lifecycleStage, 'at_risk')).all();
  stages.push({ stage: 'fetch_at_risk_contacts', input: {}, process: "Read real contacts with lifecycle_stage='at_risk' (written by the activation pipeline, not recomputed here)", output: `${atRiskContacts.length} contacts`, status: 'ok' });

  if (atRiskContacts.length === 0) {
    stages.push({ stage: 'materialize_retention_list', input: {}, process: 'No at-risk contacts to segment', output: 'skipped', status: 'ok' });
    updateOperationRunStatus(runId, 'completed', { outputPayload: { atRiskCount: 0 } });
    return { runId, stages, atRiskCount: 0, retentionListId: null };
  }

  const listId = createList({
    name: `At-Risk Contacts - Retention (${new Date().toISOString().slice(0, 10)})`,
    description: 'Real behavioral segment: contacts whose lifecycle_stage was at_risk as of this pipeline run (engaged before, but no activity in the disclosed recency window). Static snapshot, not auto-updating.',
    type: 'static',
  });
  addListMembers(listId, atRiskContacts.map((c) => c.id));
  stages.push({ stage: 'materialize_retention_list', input: { atRiskCount: atRiskContacts.length }, process: 'Create a real static list and add real contact IDs -- ready for a retention campaign', output: { listId, memberCount: atRiskContacts.length }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { atRiskCount: atRiskContacts.length, retentionListId: listId } });
  return { runId, stages, atRiskCount: atRiskContacts.length, retentionListId: listId };
}
