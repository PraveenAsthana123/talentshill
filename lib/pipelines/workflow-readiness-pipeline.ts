import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getWorkflowById } from '@/lib/db/marketing-workflow-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface WorkflowReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; workflowId: string | null }

// Real, deterministic consistency score. Real gap this pipeline exists
// to catch: PATCH /api/admin/workflows/[id] { action: 'update-status' }
// accepts ANY status value with zero validation of prerequisites -- a
// workflow can be set to 'approved' without ever going through the real
// /approve endpoint (leaving approvedBy/approvedAt null), or reach
// 'completed' with no linked content, asset, list, or campaign at all.
//   content or asset linked                                      30
//   targeting configured (list+campaign) if status != draft       25 (n/a for draft, counts as pass)
//   approval consistency (approvedBy set) if status is approved+  25 (n/a below approved, counts as pass)
//   completion consistency (completedAt set) if status=completed  20 (n/a otherwise, counts as pass)
const APPROVED_OR_BEYOND = ['approved', 'running', 'completed'];

export async function runWorkflowReadinessPipeline(params: { workflowId: string; triggeredBy?: string | null }): Promise<WorkflowReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'marketing', operationName: 'pipeline_readiness_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const workflow = getWorkflowById(params.workflowId);
  if (!workflow) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'workflow not found' });
    return { runId, stages, score: 0, workflowId: null };
  }

  const contentScore = workflow.contentId || workflow.assetId ? 30 : 0;
  stages.push({ stage: 'content_or_asset_check', input: { contentId: workflow.contentId, assetId: workflow.assetId }, process: 'Score 30 if content or an asset is linked', output: contentScore, status: 'ok' });

  const targetingApplicable = workflow.status !== 'draft';
  const targetingOk = !targetingApplicable || !!(workflow.listId && workflow.campaignId);
  const targetingScore = targetingOk ? 25 : 0;
  stages.push({ stage: 'targeting_check', input: { applicable: targetingApplicable, listId: workflow.listId, campaignId: workflow.campaignId }, process: 'Score 25 if list+campaign are set once status leaves draft (n/a for draft, counted as pass)', output: targetingScore, status: 'ok' });

  const approvalApplicable = APPROVED_OR_BEYOND.includes(workflow.status);
  const approvalOk = !approvalApplicable || !!workflow.approvedBy;
  const approvalScore = approvalOk ? 25 : 0;
  stages.push({ stage: 'approval_consistency_check', input: { applicable: approvalApplicable, approvedBy: workflow.approvedBy }, process: 'Score 25 if approvedBy is set once status is approved or beyond -- catches update-status bypassing the real /approve endpoint (n/a below approved, counted as pass)', output: approvalScore, status: 'ok' });

  const completionApplicable = workflow.status === 'completed';
  const completionOk = !completionApplicable || !!workflow.completedAt;
  const completionScore = completionOk ? 20 : 0;
  stages.push({ stage: 'completion_consistency_check', input: { applicable: completionApplicable, completedAt: workflow.completedAt }, process: 'Score 20 if completedAt is set when status=completed (n/a otherwise, counted as pass)', output: completionScore, status: 'ok' });

  const totalScore = contentScore + targetingScore + approvalScore + completionScore;
  db.update(schema.marketingWorkflows).set({ readinessScore: totalScore }).where(eq(schema.marketingWorkflows.id, params.workflowId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update marketing_workflows.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, workflowId: params.workflowId };
}
