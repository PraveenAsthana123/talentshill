import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getContentById } from '@/lib/db/marketing-content-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ContentReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; contentId: string | null }

// Real, deterministic publish-readiness score. Real gap this pipeline
// exists to catch: publishContent() (lib/db/marketing-content-queries.ts)
// has no guard today -- it will happily flip any content item to
// "published" with an empty body, no excerpt, no category, and no
// cover image. Writes to the real, previously-unused
// marketing_content.readiness_score field.
//   body substantial (100+ chars)      25
//   excerpt present                    15
//   category set                       15
//   tags present (non-empty array)     15
//   coverImage set                     15
//   title length sane (5-150 chars)    15
export async function runContentReadinessPipeline(params: { contentId: string; triggeredBy?: string | null }): Promise<ContentReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'content', operationName: 'pipeline_readiness_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const content = getContentById(params.contentId);
  if (!content) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'content not found' });
    return { runId, stages, score: 0, contentId: null };
  }

  const bodyLen = (content.body || '').trim().length;
  const bodyScore = bodyLen >= 100 ? 25 : 0;
  stages.push({ stage: 'body_check', input: `${bodyLen} chars`, process: 'Score 25 if body is 100+ chars', output: bodyScore, status: 'ok' });

  const excerptScore = content.excerpt && content.excerpt.trim().length > 0 ? 15 : 0;
  stages.push({ stage: 'excerpt_check', input: content.excerpt, process: 'Score 15 if excerpt is present', output: excerptScore, status: 'ok' });

  const categoryScore = content.category ? 15 : 0;
  stages.push({ stage: 'category_check', input: content.category, process: 'Score 15 if category is set', output: categoryScore, status: 'ok' });

  let tags: string[] = [];
  try { tags = content.tags ? JSON.parse(content.tags) : []; } catch { /* malformed, treat as none */ }
  const tagsScore = tags.length > 0 ? 15 : 0;
  stages.push({ stage: 'tags_check', input: tags, process: 'Score 15 if tags array is non-empty', output: tagsScore, status: 'ok' });

  const coverImageScore = content.coverImage ? 15 : 0;
  stages.push({ stage: 'cover_image_check', input: content.coverImage, process: 'Score 15 if coverImage is set', output: coverImageScore, status: 'ok' });

  const titleLen = content.title.length;
  const titleScore = titleLen >= 5 && titleLen <= 150 ? 15 : 0;
  stages.push({ stage: 'title_check', input: `${titleLen} chars`, process: 'Score 15 if title is 5-150 chars', output: titleScore, status: 'ok' });

  const totalScore = bodyScore + excerptScore + categoryScore + tagsScore + coverImageScore + titleScore;
  db.update(schema.marketingContent).set({ readinessScore: totalScore }).where(eq(schema.marketingContent.id, params.contentId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update marketing_content.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, contentId: params.contentId };
}
