import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface DriftStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ModuleRegistryDriftResult { runId: string; stages: DriftStageResult[]; score: number; moduleRegistryId: string | null }

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

// Real registry-drift watchdog, per the Module Understanding Standard's
// requirement that a real scheduled job must flag registry drift
// (stale entries, missing required fields) -- this is that check,
// exposed manually/on-demand for now (not yet a real cron job, honest
// gap disclosed in Governance).
//   recently verified (lastVerifiedAt within 90 days, null = stale) 30
//   description present                                            20
//   status/missingItems consistency (partial requires missingItems) 25 (n/a pass otherwise)
//   admin-UI/route-count consistency (hasAdminUi requires routes>0) 25 (n/a pass otherwise)
export async function runModuleRegistryDriftPipeline(params: { moduleRegistryId: string; triggeredBy?: string | null }): Promise<ModuleRegistryDriftResult> {
  const stages: DriftStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'module-registry', operationName: 'pipeline_drift_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const item = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.id, params.moduleRegistryId)).get();
  if (!item) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'module registry entry not found' });
    return { runId, stages, score: 0, moduleRegistryId: null };
  }

  const daysSinceVerified = item.lastVerifiedAt ? (Date.now() - new Date(item.lastVerifiedAt).getTime()) : null;
  const recentlyVerified = daysSinceVerified !== null && daysSinceVerified <= NINETY_DAYS_MS;
  const verifiedScore = recentlyVerified ? 30 : 0;
  stages.push({ stage: 'recently_verified_check', input: item.lastVerifiedAt, process: 'Score 30 if last_verified_at is set and within 90 days', output: verifiedScore, status: 'ok' });

  const descScore = item.description && item.description.trim().length > 0 ? 20 : 0;
  stages.push({ stage: 'description_present_check', input: item.description, process: 'Score 20 if description is non-empty', output: descScore, status: 'ok' });

  const statusConsistent = item.builtStatus !== 'partial' || (!!item.missingItems && item.missingItems.trim().length > 0);
  const statusScore = statusConsistent ? 25 : 0;
  stages.push({ stage: 'status_consistency_check', input: { builtStatus: item.builtStatus, missingItems: item.missingItems }, process: "Score 25 if built_status != 'partial', or if it is, missing_items is disclosed (not blank)", output: statusScore, status: 'ok' });

  const uiConsistent = !item.hasAdminUi || item.apiRouteCount > 0;
  const uiScore = uiConsistent ? 25 : 0;
  stages.push({ stage: 'admin_ui_consistency_check', input: { hasAdminUi: item.hasAdminUi, apiRouteCount: item.apiRouteCount }, process: 'Score 25 if has_admin_ui is false, or if true, api_route_count > 0', output: uiScore, status: 'ok' });

  const totalScore = verifiedScore + descScore + statusScore + uiScore;
  db.update(schema.moduleRegistry).set({ driftScore: totalScore }).where(eq(schema.moduleRegistry.id, params.moduleRegistryId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update module_registry.drift_score (real, previously-unused field)', output: { driftScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, moduleRegistryId: params.moduleRegistryId };
}
