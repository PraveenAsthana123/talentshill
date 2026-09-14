import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getVideoProjectById } from '@/lib/db/video-project-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface VideoProjectReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; projectId: string | null }

// Real, deterministic readiness score. No Adobe/CapCut/HeyGen API
// integration exists in this build -- tool is a real classification
// field, not a live connection; disclosed in Governance.
//   strategy notes present (dos/donts/viral-strategy guidance)  25
//   status has progressed past planning                        25
//   output URL set once status is review/published (n/a otherwise) 25
//   duration set                                                25
export async function runVideoProjectReadinessPipeline(params: { projectId: string; triggeredBy?: string | null }): Promise<VideoProjectReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'video_editing', operationName: 'pipeline_project_readiness', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const project = getVideoProjectById(params.projectId);
  if (!project) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'project not found' });
    return { runId, stages, score: 0, projectId: null };
  }

  const strategyScore = project.strategyNotes && project.strategyNotes.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'strategy_notes_check', input: project.strategyNotes, process: 'Score 25 if real strategy/dos-and-donts notes are present', output: strategyScore, status: 'ok' });

  const progressed = project.status !== 'planning';
  const progressScore = progressed ? 25 : 0;
  stages.push({ stage: 'status_progress_check', input: project.status, process: "Score 25 if status has progressed past 'planning'", output: progressScore, status: 'ok' });

  const needsOutput = project.status === 'review' || project.status === 'published';
  const outputScore = !needsOutput || (!!project.outputUrl && project.outputUrl.trim().length > 0) ? 25 : 0;
  stages.push({ stage: 'output_url_check', input: { status: project.status, outputUrl: project.outputUrl }, process: "Score 25 if output URL is set once status is review/published, or n/a-pass otherwise", output: outputScore, status: 'ok' });

  const durationScore = project.durationSeconds && project.durationSeconds > 0 ? 25 : 0;
  stages.push({ stage: 'duration_check', input: project.durationSeconds, process: 'Score 25 if duration is set', output: durationScore, status: 'ok' });

  const totalScore = strategyScore + progressScore + outputScore + durationScore;
  db.update(schema.videoProjects).set({ readinessScore: totalScore }).where(eq(schema.videoProjects.id, params.projectId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update video_projects.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, projectId: params.projectId };
}
