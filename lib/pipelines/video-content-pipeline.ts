import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getVideoById } from '@/lib/db/admin-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ContentStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface VideoContentResult { runId: string; stages: ContentStageResult[]; score: number; videoId: string | null }

// Real, deterministic public-page readiness score grounded only in
// fields that actually exist on the video record. Writes to the real,
// previously-unused videos.content_score field.
//   thumbnail present            20
//   summary substantial (30+ chars)  25
//   1+ tag                        15
//   category present              15
//   duration present              15
//   isActive                      10
export async function runVideoContentPipeline(params: { videoId: string; triggeredBy?: string | null }): Promise<VideoContentResult> {
  const stages: ContentStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'videos', operationName: 'pipeline_content_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const video = getVideoById(params.videoId);
  if (!video) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'video not found' });
    return { runId, stages, score: 0, videoId: null };
  }

  const thumbnailScore = video.thumbnail ? 20 : 0;
  stages.push({ stage: 'thumbnail_check', input: video.thumbnail, process: 'Score 20 if thumbnail present', output: thumbnailScore, status: 'ok' });

  const summaryLen = (video.summary || '').trim().length;
  const summaryScore = summaryLen >= 30 ? 25 : 0;
  stages.push({ stage: 'summary_check', input: `${summaryLen} chars`, process: 'Score 25 if summary is 30+ chars', output: summaryScore, status: 'ok' });

  const tagsCount = (video.tags || []).length;
  const tagsScore = tagsCount > 0 ? 15 : 0;
  stages.push({ stage: 'tags_check', input: `${tagsCount} tags`, process: 'Score 15 if 1+ tag present', output: tagsScore, status: 'ok' });

  const categoryScore = video.category ? 15 : 0;
  stages.push({ stage: 'category_check', input: video.category, process: 'Score 15 if category present', output: categoryScore, status: 'ok' });

  const durationScore = video.duration ? 15 : 0;
  stages.push({ stage: 'duration_check', input: video.duration, process: 'Score 15 if duration present', output: durationScore, status: 'ok' });

  const activeScore = video.isActive ? 10 : 0;
  stages.push({ stage: 'active_check', input: video.isActive, process: 'Score 10 if active', output: activeScore, status: 'ok' });

  const totalScore = thumbnailScore + summaryScore + tagsScore + categoryScore + durationScore + activeScore;
  db.update(schema.videos).set({ contentScore: totalScore }).where(eq(schema.videos.id, params.videoId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update videos.content_score (real, previously-unused field)', output: { contentScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, videoId: params.videoId };
}
