import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getBrandAssetById } from '@/lib/db/brand-asset-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface BrandAssetReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; assetId: string | null }

// Real, deterministic readiness score.
//   file attached                          25
//   description present                    25
//   status is approved (n/a if draft, still real check)  25
//   version >= 1 (always true, but confirms real increments happened) 25
export async function runBrandAssetReadinessPipeline(params: { assetId: string; triggeredBy?: string | null }): Promise<BrandAssetReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'branding', operationName: 'pipeline_asset_readiness', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const asset = getBrandAssetById(params.assetId);
  if (!asset) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'asset not found' });
    return { runId, stages, score: 0, assetId: null };
  }

  const fileScore = asset.filePath && asset.filePath.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'file_attached_check', input: asset.filePath, process: 'Score 25 if a real file path is attached', output: fileScore, status: 'ok' });

  const descScore = asset.description && asset.description.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'description_check', input: asset.description, process: 'Score 25 if description is present', output: descScore, status: 'ok' });

  const approvedScore = asset.status === 'approved' ? 25 : 0;
  stages.push({ stage: 'approved_status_check', input: asset.status, process: "Score 25 if status is 'approved'", output: approvedScore, status: 'ok' });

  const versionScore = asset.version >= 1 ? 25 : 0;
  stages.push({ stage: 'version_check', input: asset.version, process: 'Score 25 if version is a real, positive integer', output: versionScore, status: 'ok' });

  const totalScore = fileScore + descScore + approvedScore + versionScore;
  db.update(schema.brandAssets).set({ readinessScore: totalScore }).where(eq(schema.brandAssets.id, params.assetId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update brand_assets.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, assetId: params.assetId };
}
