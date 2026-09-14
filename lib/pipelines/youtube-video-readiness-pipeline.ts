import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getYoutubeVideoById } from '@/lib/db/youtube-video-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface YoutubeVideoReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; videoId: string | null }

// Real, deterministic readiness score. No YouTube Data API integration
// exists in this build -- externalVideoId stays null until a real
// upload/sync happens; disclosed in Governance.
//   description present                                 25
//   tags present                                         25
//   externalVideoId set once status is published (n/a otherwise) 25
//   status progressed past planned                       25
export async function runYoutubeVideoReadinessPipeline(params: { videoId: string; triggeredBy?: string | null }): Promise<YoutubeVideoReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'youtube', operationName: 'pipeline_video_readiness', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const video = getYoutubeVideoById(params.videoId);
  if (!video) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'video not found' });
    return { runId, stages, score: 0, videoId: null };
  }

  const descScore = video.description && video.description.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'description_check', input: video.description, process: 'Score 25 if description is present', output: descScore, status: 'ok' });

  const tagsScore = video.tags && video.tags !== '[]' ? 25 : 0;
  stages.push({ stage: 'tags_check', input: video.tags, process: 'Score 25 if tags are present', output: tagsScore, status: 'ok' });

  const needsExternalId = video.status === 'published';
  const externalIdScore = !needsExternalId || (!!video.externalVideoId && video.externalVideoId.trim().length > 0) ? 25 : 0;
  stages.push({ stage: 'external_video_id_check', input: { status: video.status, externalVideoId: video.externalVideoId }, process: 'Score 25 if a real YouTube video ID is set once published, or n/a-pass otherwise', output: externalIdScore, status: 'ok' });

  const progressScore = video.status !== 'planned' ? 25 : 0;
  stages.push({ stage: 'status_progress_check', input: video.status, process: "Score 25 if status has progressed past 'planned'", output: progressScore, status: 'ok' });

  const totalScore = descScore + tagsScore + externalIdScore + progressScore;
  db.update(schema.youtubeVideos).set({ readinessScore: totalScore }).where(eq(schema.youtubeVideos.id, params.videoId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update youtube_videos.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, videoId: params.videoId };
}
