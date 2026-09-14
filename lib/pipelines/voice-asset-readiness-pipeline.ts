import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getVoiceAssetById } from '@/lib/db/voice-asset-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface VoiceAssetReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; assetId: string | null }

// Real, deterministic readiness score. No voice-cloning/TTS/STT API
// integration exists in this build -- content/filePath are real
// locally-entered fields, disclosed in Governance.
//   content or filePath present            25
//   status has progressed past draft        25
//   duration set once type=recording        25 (n/a otherwise)
//   title is substantive (>3 chars)         25
export async function runVoiceAssetReadinessPipeline(params: { assetId: string; triggeredBy?: string | null }): Promise<VoiceAssetReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'voice_ai', operationName: 'pipeline_asset_readiness', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const asset = getVoiceAssetById(params.assetId);
  if (!asset) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'asset not found' });
    return { runId, stages, score: 0, assetId: null };
  }

  const contentScore = (asset.content && asset.content.trim().length > 0) || (asset.filePath && asset.filePath.trim().length > 0) ? 25 : 0;
  stages.push({ stage: 'content_present_check', input: { content: !!asset.content, filePath: !!asset.filePath }, process: 'Score 25 if real content or a real file path is present', output: contentScore, status: 'ok' });

  const progressScore = asset.status !== 'draft' ? 25 : 0;
  stages.push({ stage: 'status_progress_check', input: asset.status, process: "Score 25 if status has progressed past 'draft'", output: progressScore, status: 'ok' });

  const needsDuration = asset.type === 'recording';
  const durationScore = !needsDuration || (asset.durationSeconds !== null && asset.durationSeconds !== undefined && asset.durationSeconds > 0) ? 25 : 0;
  stages.push({ stage: 'duration_check', input: { type: asset.type, durationSeconds: asset.durationSeconds }, process: 'Score 25 if duration is set for a recording, or n/a-pass otherwise', output: durationScore, status: 'ok' });

  const titleScore = asset.title.trim().length > 3 ? 25 : 0;
  stages.push({ stage: 'title_substantive_check', input: asset.title, process: 'Score 25 if title is substantive (>3 chars)', output: titleScore, status: 'ok' });

  const totalScore = contentScore + progressScore + durationScore + titleScore;
  db.update(schema.voiceAssets).set({ readinessScore: totalScore }).where(eq(schema.voiceAssets.id, params.assetId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update voice_assets.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, assetId: params.assetId };
}
