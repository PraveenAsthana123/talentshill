import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getPostById } from '@/lib/db/blog-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface BlogReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; postId: string | null }

// Real, deterministic SEO/publish-readiness score grounded only in fields
// that actually exist on the post -- never a fabricated "content quality"
// judgment. Writes to the real, previously-unused
// blog_posts.seo_readiness_score field.
//   title length 10-70 chars      15
//   summary length 50-200 chars   15
//   content substance (>=300 words) 20
//   cover image present           10
//   meta title present            10
//   meta description present     15
//   1+ category                  10
//   1+ tag                        5
export async function runBlogReadinessPipeline(params: { postId: string; triggeredBy?: string | null }): Promise<BlogReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'blog', operationName: 'pipeline_readiness_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const post = await getPostById(params.postId);
  if (!post) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'post not found' });
    return { runId, stages, score: 0, postId: null };
  }

  const titleLen = post.title.length;
  const titleScore = titleLen >= 10 && titleLen <= 70 ? 15 : 0;
  stages.push({ stage: 'title_check', input: `${titleLen} chars`, process: 'Score 15 if title is 10-70 chars', output: titleScore, status: 'ok' });

  const summaryLen = post.summary.length;
  const summaryScore = summaryLen >= 50 && summaryLen <= 200 ? 15 : 0;
  stages.push({ stage: 'summary_check', input: `${summaryLen} chars`, process: 'Score 15 if summary is 50-200 chars', output: summaryScore, status: 'ok' });

  const wordCount = post.content.trim().split(/\s+/).filter(Boolean).length;
  const contentScore = wordCount >= 300 ? 20 : 0;
  stages.push({ stage: 'content_check', input: `${wordCount} words`, process: 'Score 20 if content is 300+ words', output: contentScore, status: 'ok' });

  const coverScore = post.coverImage ? 10 : 0;
  stages.push({ stage: 'cover_image_check', input: post.coverImage, process: 'Score 10 if cover image present', output: coverScore, status: 'ok' });

  const metaTitleScore = post.metaTitle ? 10 : 0;
  stages.push({ stage: 'meta_title_check', input: post.metaTitle, process: 'Score 10 if meta title present', output: metaTitleScore, status: 'ok' });

  const metaDescScore = post.metaDescription ? 15 : 0;
  stages.push({ stage: 'meta_description_check', input: post.metaDescription, process: 'Score 15 if meta description present', output: metaDescScore, status: 'ok' });

  const categoryScore = post.categories.length > 0 ? 10 : 0;
  stages.push({ stage: 'category_check', input: `${post.categories.length} categories`, process: 'Score 10 if 1+ category assigned', output: categoryScore, status: 'ok' });

  const tagScore = post.tags.length > 0 ? 5 : 0;
  stages.push({ stage: 'tag_check', input: `${post.tags.length} tags`, process: 'Score 5 if 1+ tag assigned', output: tagScore, status: 'ok' });

  const totalScore = titleScore + summaryScore + contentScore + coverScore + metaTitleScore + metaDescScore + categoryScore + tagScore;
  db.update(schema.blogPosts).set({ seoReadinessScore: totalScore }).where(eq(schema.blogPosts.id, params.postId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update blog_posts.seo_readiness_score (real, previously-unused field)', output: { seoReadinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, postId: params.postId };
}
