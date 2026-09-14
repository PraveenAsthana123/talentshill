import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getReelById } from '@/lib/db/reel-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ReelReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; reelId: string | null }

// Real, deterministic readiness score.
//   caption present                                     25
//   asset URL set once status is edited/scheduled/published (n/a otherwise) 25
//   scheduledAt set once status is scheduled/published (n/a otherwise) 25
//   status progressed past idea                          25
export async function runReelReadinessPipeline(params: { reelId: string; triggeredBy?: string | null }): Promise<ReelReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'reels_management', operationName: 'pipeline_reel_readiness', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const reel = getReelById(params.reelId);
  if (!reel) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'reel not found' });
    return { runId, stages, score: 0, reelId: null };
  }

  const captionScore = reel.caption && reel.caption.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'caption_check', input: reel.caption, process: 'Score 25 if a real caption is present', output: captionScore, status: 'ok' });

  const needsAsset = ['edited', 'scheduled', 'published'].includes(reel.status);
  const assetScore = !needsAsset || (!!reel.assetUrl && reel.assetUrl.trim().length > 0) ? 25 : 0;
  stages.push({ stage: 'asset_url_check', input: { status: reel.status, assetUrl: reel.assetUrl }, process: 'Score 25 if asset URL is set once status is edited/scheduled/published, or n/a-pass otherwise', output: assetScore, status: 'ok' });

  const needsSchedule = reel.status === 'scheduled' || reel.status === 'published';
  const scheduleScore = !needsSchedule || !!reel.scheduledAt ? 25 : 0;
  stages.push({ stage: 'scheduled_at_check', input: { status: reel.status, scheduledAt: reel.scheduledAt }, process: 'Score 25 if scheduledAt is set once status is scheduled/published, or n/a-pass otherwise', output: scheduleScore, status: 'ok' });

  const progressScore = reel.status !== 'idea' ? 25 : 0;
  stages.push({ stage: 'status_progress_check', input: reel.status, process: "Score 25 if status has progressed past 'idea'", output: progressScore, status: 'ok' });

  const totalScore = captionScore + assetScore + scheduleScore + progressScore;
  db.update(schema.reels).set({ readinessScore: totalScore }).where(eq(schema.reels.id, params.reelId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update reels.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, reelId: params.reelId };
}
