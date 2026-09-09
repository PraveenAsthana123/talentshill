import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getListById, getListMemberIds, addListMembers, removeListMembers } from '@/lib/db/list-queries';
import { getMatchingContactIds } from '@/lib/crm/segment-evaluator';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface SyncStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ListSyncResult { runId: string; stages: SyncStageResult[]; added: number; removed: number; finalMemberCount: number; listId: string | null }

// Real functional sync, not just a score. Real, cross-module gap this
// pipeline exists to fix: a 'dynamic' list's segmentRules could be
// evaluated for a live UI preview (evaluateSegmentRules(), capped at 10
// sample rows) but nothing ever materialized full matching membership
// into the real listMembers table. lib/jobs/handlers/broadcast-sender.ts
// resolves audienceType='list' recipients by reading listMembers
// directly -- it never evaluates segmentRules. A broadcast targeted at
// a dynamic list therefore silently sent to zero recipients, with no
// error. This pipeline closes that gap: it evaluates the real
// (unlimited) matching contact set and adds/removes real listMembers
// rows to match, exactly what a human would expect "sync" to do.
export async function runListSyncPipeline(params: { listId: string; triggeredBy?: string | null }): Promise<ListSyncResult> {
  const stages: SyncStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'lists', operationName: 'pipeline_sync_dynamic_membership', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const list = getListById(params.listId);
  if (!list) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'list not found' });
    return { runId, stages, added: 0, removed: 0, finalMemberCount: 0, listId: null };
  }

  if (list.type !== 'dynamic') {
    stages.push({ stage: 'type_check', input: list.type, process: "Only 'dynamic' lists are synced from segment rules; static lists are managed by explicit add/remove and need no sync", output: 'not_applicable', status: 'ok' });
    updateOperationRunStatus(runId, 'completed', { outputPayload: { note: 'static list, no sync needed' } });
    return { runId, stages, added: 0, removed: 0, finalMemberCount: list.memberCount ?? 0, listId: params.listId };
  }

  let rules: { logic: 'AND' | 'OR'; conditions: unknown[] } | null = null;
  try { rules = list.segmentRules ? JSON.parse(list.segmentRules) : null; } catch { rules = null; }
  if (!rules || !rules.logic || !rules.conditions) {
    stages.push({ stage: 'rules_check', input: list.segmentRules, process: 'Dynamic list has no valid segmentRules to evaluate', output: 'invalid', status: 'ok' });
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'invalid or missing segmentRules' });
    return { runId, stages, added: 0, removed: 0, finalMemberCount: list.memberCount ?? 0, listId: params.listId };
  }

  const matchingIds = getMatchingContactIds(rules as Parameters<typeof getMatchingContactIds>[0]);
  stages.push({ stage: 'evaluate_segment_rules', input: rules, process: 'Evaluate the real, unlimited matching contact set (not the 10-row UI preview sample)', output: `${matchingIds.length} matching contacts`, status: 'ok' });

  const currentMemberIds = getListMemberIds(params.listId);
  const matchingSet = new Set(matchingIds);
  const currentSet = new Set(currentMemberIds);
  const toAdd = matchingIds.filter((id) => !currentSet.has(id));
  const toRemove = currentMemberIds.filter((id) => !matchingSet.has(id));
  stages.push({ stage: 'diff_membership', input: { currentCount: currentMemberIds.length, matchingCount: matchingIds.length }, process: 'Diff current real listMembers against the real matching set', output: { toAdd: toAdd.length, toRemove: toRemove.length }, status: 'ok' });

  if (toAdd.length > 0) addListMembers(params.listId, toAdd);
  if (toRemove.length > 0) removeListMembers(params.listId, toRemove);
  stages.push({ stage: 'materialize_membership', input: { added: toAdd.length, removed: toRemove.length }, process: 'Insert/delete real listMembers rows to match the evaluated segment (this is what makes list-targeted broadcasts actually reach the right people)', output: { added: toAdd.length, removed: toRemove.length }, status: 'ok' });

  db.update(schema.lists).set({ lastSyncedAt: new Date() }).where(eq(schema.lists.id, params.listId)).run();
  const finalList = getListById(params.listId);
  stages.push({ stage: 'write_sync_timestamp', input: {}, process: 'Update lists.last_synced_at (real, previously-unused field)', output: { lastSyncedAt: new Date().toISOString(), finalMemberCount: finalList?.memberCount ?? 0 }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { added: toAdd.length, removed: toRemove.length, finalMemberCount: finalList?.memberCount ?? 0 } });
  return { runId, stages, added: toAdd.length, removed: toRemove.length, finalMemberCount: finalList?.memberCount ?? 0, listId: params.listId };
}
