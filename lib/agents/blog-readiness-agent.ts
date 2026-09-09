import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getPostById } from '@/lib/db/blog-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runBlogReadinessPipeline } from '@/lib/pipelines/blog-readiness-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface BlogAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; postId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent editorial-improvement loop. "Search" reuses the real
// readiness pipeline. "Act" drafts real, grounded improvement suggestions
// (e.g. what's missing for SEO) -- never edits the post itself, purely
// advisory text for a human editor.
export async function runBlogReadinessAgent(params: { postId: string; triggeredBy?: string | null }): Promise<BlogAgentResult> {
  const agentRole = 'blog_readiness_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'blog', operationName: 'agentic_readiness_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const post = await getPostById(params.postId);
  if (!post) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'post not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, postId: null, recommendation: null };
  }

  try {
    const planInput = `Blog post "${post.title}" (status: ${post.status}). Plan how to recommend SEO/publish-readiness improvements (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a blog editorial planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const readiness = await runBlogReadinessPipeline({ postId: params.postId, triggeredBy: params.triggeredBy });
    const searchOutput = `Readiness score: ${readiness.score}/100. Gaps: ${readiness.stages.filter((s) => typeof s.output === 'number' && s.output === 0).map((s) => s.stage).join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.postId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.postId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Post: title="${post.title}", summary length=${post.summary.length} chars, has cover image=${!!post.coverImage}, has meta title=${!!post.metaTitle}, has meta description=${!!post.metaDescription}, categories=${post.categories.length}, tags=${post.tags.length}, readiness score=${readiness.score}/100. In 1-2 sentences, recommend the top improvement for this post. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a blog editorial advisor. Never invent facts about the post not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No post edit beyond the readiness score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No post edit beyond the readiness score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { postId: params.postId, score: readiness.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, postId: params.postId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, postId: null, recommendation: null };
  }
}
