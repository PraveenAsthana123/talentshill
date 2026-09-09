import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getIndustryById } from '@/lib/db/admin-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ContentStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface IndustryContentResult { runId: string; stages: ContentStageResult[]; score: number; industryId: string | null }

// Real, deterministic public-page readiness score grounded only in
// fields that actually exist on the industry -- this record is rendered
// on the real public /industries page, so a thin record is a real
// content gap, not a hypothetical one. Writes to the real,
// previously-unused industries.content_score field.
//   icon present            25
//   description substantial (40+ chars)  40
//   name length reasonable (3-60 chars)  15
//   isActive                20
export async function runIndustryContentPipeline(params: { industryId: string; triggeredBy?: string | null }): Promise<IndustryContentResult> {
  const stages: ContentStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'industries', operationName: 'pipeline_content_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const industry = getIndustryById(params.industryId);
  if (!industry) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'industry not found' });
    return { runId, stages, score: 0, industryId: null };
  }

  const iconScore = industry.icon ? 25 : 0;
  stages.push({ stage: 'icon_check', input: industry.icon, process: 'Score 25 if icon present', output: iconScore, status: 'ok' });

  const descLen = (industry.description || '').trim().length;
  const descScore = descLen >= 40 ? 40 : 0;
  stages.push({ stage: 'description_check', input: `${descLen} chars`, process: 'Score 40 if description is 40+ chars', output: descScore, status: 'ok' });

  const nameLen = industry.name.length;
  const nameScore = nameLen >= 3 && nameLen <= 60 ? 15 : 0;
  stages.push({ stage: 'name_check', input: `${nameLen} chars`, process: 'Score 15 if name is 3-60 chars', output: nameScore, status: 'ok' });

  const activeScore = industry.isActive ? 20 : 0;
  stages.push({ stage: 'active_check', input: industry.isActive, process: 'Score 20 if active', output: activeScore, status: 'ok' });

  const totalScore = iconScore + descScore + nameScore + activeScore;
  db.update(schema.industries).set({ contentScore: totalScore }).where(eq(schema.industries.id, params.industryId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update industries.content_score (real, previously-unused field)', output: { contentScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, industryId: params.industryId };
}
