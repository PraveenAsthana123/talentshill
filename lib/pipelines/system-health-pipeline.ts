import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { sql, eq } from 'drizzle-orm';
import { getQueueStats } from '@/lib/db/job-queries';
import { isJobRunnerRunning } from '@/lib/jobs/runner';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import * as fs from 'fs';
import * as path from 'path';

export interface HealthStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface SystemHealthResult { runId: string; snapshotId: string; stages: HealthStageResult[]; score: number }

// Real, deterministic system-health score, rolled up from the same
// data the existing /api/admin/health endpoint already reads (job
// runner status, job queue stats, recent job_logs errors, DB file
// size). Health has no single entity to update in place, so each run
// inserts a new timestamped health_snapshots row.
//   job runner running                          25
//   0 recent errors in job_logs (last 10 checked) 25
//   job failure rate <= 10%                       30
//   DB file readable and non-zero size            20
export async function runSystemHealthPipeline(params: { triggeredBy?: string | null }): Promise<SystemHealthResult> {
  const stages: HealthStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'health', operationName: 'pipeline_system_health_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const runnerRunning = isJobRunnerRunning();
  const runnerScore = runnerRunning ? 25 : 0;
  stages.push({ stage: 'job_runner_check', input: runnerRunning, process: 'Score 25 if the job runner is running', output: runnerScore, status: 'ok' });

  const recentErrors = db.select().from(schema.jobLogs).where(eq(schema.jobLogs.level, 'error')).orderBy(sql`created_at DESC`).limit(10).all();
  const errorsScore = recentErrors.length === 0 ? 25 : 0;
  stages.push({ stage: 'recent_errors_check', input: `${recentErrors.length} recent errors`, process: 'Score 25 if 0 recent errors in job_logs (last 10 checked)', output: errorsScore, status: 'ok' });

  const queueStats = getQueueStats();
  const totalJobs = (queueStats.completed || 0) + (queueStats.failed || 0);
  const failureRate = totalJobs > 0 ? (queueStats.failed || 0) / totalJobs : 0;
  const failureRateScore = failureRate <= 0.1 ? 30 : 0;
  stages.push({ stage: 'job_failure_rate_check', input: `${(failureRate * 100).toFixed(1)}% (${queueStats.failed}/${totalJobs})`, process: 'Score 30 if job failure rate is <=10%', output: failureRateScore, status: 'ok' });

  const dbPath = path.join(process.cwd(), 'data', 'talentshill.db');
  let dbSizeMB = 0;
  try { dbSizeMB = Math.round(fs.statSync(dbPath).size / 1024 / 1024 * 100) / 100; } catch { /* unreadable */ }
  const dbSizeScore = dbSizeMB > 0 ? 20 : 0;
  stages.push({ stage: 'db_size_check', input: `${dbSizeMB} MB`, process: 'Score 20 if the DB file is readable and non-zero size', output: dbSizeScore, status: 'ok' });

  const totalScore = runnerScore + errorsScore + failureRateScore + dbSizeScore;
  const snapshotId = randomUUID();
  db.insert(schema.healthSnapshots).values({
    id: snapshotId,
    healthScore: totalScore,
    jobRunnerScore: runnerScore,
    recentErrorsScore: errorsScore,
    jobFailureRateScore: failureRateScore,
    dbSizeScore: dbSizeScore,
    inputSnapshot: JSON.stringify({ runnerRunning, recentErrorCount: recentErrors.length, queueStats, dbSizeMB }),
    triggeredBy: params.triggeredBy || null,
    createdAt: new Date(),
  }).run();
  stages.push({ stage: 'write_snapshot', input: { totalScore }, process: 'Insert a new health_snapshots row (point-in-time, not an update-in-place)', output: { snapshotId, healthScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore, snapshotId } });
  return { runId, snapshotId, stages, score: totalScore };
}
