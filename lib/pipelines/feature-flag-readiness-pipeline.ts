import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getFlagById, getFlagHistory } from '@/lib/db/feature-flag-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface FlagReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; flagId: string | null }

const KEY_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

// Real, deterministic governance-completeness score for a feature flag.
// A real gap this pipeline exists to catch: createFlag()
// (lib/db/feature-flag-queries.ts) never writes an initial
// feature_flag_versions row -- only toggleFlag()/createFlagVersion()
// do. A flag that has sat unchanged since creation has an empty
// version history despite being a real, active flag.
//   description present (documents intent)   25
//   module assigned (traceable ownership)     25
//   has version history (1+ real version)     30
//   key format valid (lowercase slug-like)    20
export async function runFeatureFlagReadinessPipeline(params: { flagId: string; triggeredBy?: string | null }): Promise<FlagReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'features', operationName: 'pipeline_readiness_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const flag = getFlagById(params.flagId);
  if (!flag) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'flag not found' });
    return { runId, stages, score: 0, flagId: null };
  }

  const descScore = flag.description && flag.description.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'description_check', input: flag.description, process: 'Score 25 if description is present', output: descScore, status: 'ok' });

  const moduleScore = flag.module ? 25 : 0;
  stages.push({ stage: 'module_check', input: flag.module, process: 'Score 25 if module is assigned', output: moduleScore, status: 'ok' });

  const history = getFlagHistory(params.flagId);
  const historyScore = history.length > 0 ? 30 : 0;
  stages.push({ stage: 'version_history_check', input: `${history.length} versions`, process: 'Score 30 if 1+ version snapshot exists (createFlag() alone writes none -- only a toggle or explicit version creates one)', output: historyScore, status: 'ok' });

  const keyScore = KEY_PATTERN.test(flag.key) ? 20 : 0;
  stages.push({ stage: 'key_format_check', input: flag.key, process: 'Score 20 if key is a lowercase slug-like identifier', output: keyScore, status: 'ok' });

  const totalScore = descScore + moduleScore + historyScore + keyScore;
  db.update(schema.featureFlags).set({ readinessScore: totalScore }).where(eq(schema.featureFlags.id, params.flagId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update feature_flags.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, flagId: params.flagId };
}
