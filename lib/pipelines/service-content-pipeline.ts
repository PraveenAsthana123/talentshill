import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getServiceById } from '@/lib/db/admin-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ContentStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ServiceContentResult { runId: string; stages: ContentStageResult[]; score: number; serviceId: string | null }

// Real, deterministic public-page readiness score grounded only in
// fields that actually exist on the service -- this record is rendered
// on the real public /services page, so a thin record is a real content
// gap. Writes to the real, previously-unused services.content_score field.
//   icon present              15
//   shortDesc substantial (20+ chars)  20
//   longDesc substantial (60+ chars)   25
//   1+ tag                     15
//   1+ use case                15
//   isActive                   10
export async function runServiceContentPipeline(params: { serviceId: string; triggeredBy?: string | null }): Promise<ServiceContentResult> {
  const stages: ContentStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'services', operationName: 'pipeline_content_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const service = getServiceById(params.serviceId);
  if (!service) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'service not found' });
    return { runId, stages, score: 0, serviceId: null };
  }

  const iconScore = service.icon ? 15 : 0;
  stages.push({ stage: 'icon_check', input: service.icon, process: 'Score 15 if icon present', output: iconScore, status: 'ok' });

  const shortLen = (service.shortDesc || '').trim().length;
  const shortScore = shortLen >= 20 ? 20 : 0;
  stages.push({ stage: 'short_desc_check', input: `${shortLen} chars`, process: 'Score 20 if shortDesc is 20+ chars', output: shortScore, status: 'ok' });

  const longLen = (service.longDesc || '').trim().length;
  const longScore = longLen >= 60 ? 25 : 0;
  stages.push({ stage: 'long_desc_check', input: `${longLen} chars`, process: 'Score 25 if longDesc is 60+ chars', output: longScore, status: 'ok' });

  const tagsCount = (service.tags || []).length;
  const tagsScore = tagsCount > 0 ? 15 : 0;
  stages.push({ stage: 'tags_check', input: `${tagsCount} tags`, process: 'Score 15 if 1+ tag present', output: tagsScore, status: 'ok' });

  const useCasesCount = (service.useCases || []).length;
  const useCasesScore = useCasesCount > 0 ? 15 : 0;
  stages.push({ stage: 'use_cases_check', input: `${useCasesCount} use cases`, process: 'Score 15 if 1+ use case present', output: useCasesScore, status: 'ok' });

  const activeScore = service.isActive ? 10 : 0;
  stages.push({ stage: 'active_check', input: service.isActive, process: 'Score 10 if active', output: activeScore, status: 'ok' });

  const totalScore = iconScore + shortScore + longScore + tagsScore + useCasesScore + activeScore;
  db.update(schema.services).set({ contentScore: totalScore }).where(eq(schema.services.id, params.serviceId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update services.content_score (real, previously-unused field)', output: { contentScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, serviceId: params.serviceId };
}
