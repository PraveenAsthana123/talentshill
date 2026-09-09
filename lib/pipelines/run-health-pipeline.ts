import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getRun, getRunTimeline } from '@/lib/db/run-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface HealthStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface RunHealthResult { runHealthRunId: string; stages: HealthStageResult[]; score: number; targetRunId: string | null }

const STUCK_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

// Real health check for a single row in the runs table (the cross-
// module Run Console). Catches a run left permanently 'active' by a
// crashed job that never reached its completion/failure handler --
// the exact failure mode this pipeline's own broadcast-sender fix
// (try/catch wrapping the send loop) now guards against for broadcasts.
//   startedAt is set once status has progressed past draft/scheduled  25
//   completedAt is set once status is completed/failed (n/a otherwise) 25
//   not stuck: an 'active' run has a recent event within 2h (n/a otherwise) 25
//   config (if present) is valid JSON                                 25
export async function runRunHealthPipeline(params: { targetRunId: string; triggeredBy?: string | null }): Promise<RunHealthResult> {
  const stages: HealthStageResult[] = [];
  const runHealthRunId = logOperationRun({ moduleKey: 'runs', operationName: 'pipeline_run_health', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const target = getRun(params.targetRunId);
  if (!target) {
    updateOperationRunStatus(runHealthRunId, 'failed', { errorMessage: 'run not found' });
    return { runHealthRunId, stages, score: 0, targetRunId: null };
  }

  const progressed = ['active', 'completed', 'failed', 'paused'].includes(target.status);
  const startedScore = !progressed || !!target.startedAt ? 25 : 0;
  stages.push({ stage: 'started_at_check', input: { status: target.status, startedAt: target.startedAt }, process: "Score 25 if started_at is set once status has progressed past draft/scheduled, or n/a-pass otherwise", output: startedScore, status: 'ok' });

  const isTerminal = target.status === 'completed' || target.status === 'failed';
  const completedScore = !isTerminal || !!target.completedAt ? 25 : 0;
  stages.push({ stage: 'completed_at_check', input: { status: target.status, completedAt: target.completedAt }, process: "Score 25 if completed_at is set once status is completed/failed, or n/a-pass otherwise", output: completedScore, status: 'ok' });

  let notStuckScore = 25;
  let staleness: unknown = 'n/a (not active)';
  if (target.status === 'active') {
    const timeline = getRunTimeline(params.targetRunId);
    const latestEvent = timeline[0];
    const lastActivityAt = latestEvent ? new Date(latestEvent.createdAt).getTime() : (target.startedAt ? new Date(target.startedAt).getTime() : new Date(target.createdAt).getTime());
    const ageMs = Date.now() - lastActivityAt;
    notStuckScore = ageMs <= STUCK_THRESHOLD_MS ? 25 : 0;
    staleness = { lastActivityAt: new Date(lastActivityAt).toISOString(), ageMinutes: Math.round(ageMs / 60000) };
  }
  stages.push({ stage: 'not_stuck_check', input: staleness, process: "Score 25 if an 'active' run has activity within the last 2 hours, or n/a-pass otherwise", output: notStuckScore, status: 'ok' });

  let configScore = 25;
  if (target.config) {
    try { JSON.parse(target.config); } catch { configScore = 0; }
  }
  stages.push({ stage: 'config_parseable_check', input: target.config, process: 'Score 25 if config (when present) is valid JSON, or n/a-pass if absent', output: configScore, status: 'ok' });

  const totalScore = startedScore + completedScore + notStuckScore + configScore;
  db.update(schema.runs).set({ healthScore: totalScore }).where(eq(schema.runs.id, params.targetRunId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update runs.health_score (real, previously-unused field)', output: { healthScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runHealthRunId, 'completed', { outputPayload: { score: totalScore } });
  return { runHealthRunId, stages, score: totalScore, targetRunId: params.targetRunId };
}
