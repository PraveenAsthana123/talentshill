import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getContentById } from '@/lib/db/marketing-content-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runContentReadinessPipeline } from '@/lib/pipelines/content-readiness-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ContentAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; contentId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent publish-readiness loop. "Search" reuses the real
// readiness pipeline. "Act" drafts a real, grounded pre-publish
// recommendation -- never publishes the content itself, purely
// advisory text for a human editor.
export async function runContentReadinessAgent(params: { contentId: string; triggeredBy?: string | null }): Promise<ContentAgentResult> {
  const agentRole = 'content_readiness_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'content', operationName: 'agentic_readiness_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const content = getContentById(params.contentId);
  if (!content) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'content not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, contentId: null, recommendation: null };
  }

  try {
    const planInput = `Content "${content.title}" (type: ${content.contentType}, status: ${content.status}). Plan how to recommend a pre-publish readiness improvement (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a content-publish-readiness planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const readiness = await runContentReadinessPipeline({ contentId: params.contentId, triggeredBy: params.triggeredBy });
    const failedChecks = readiness.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Readiness score: ${readiness.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.contentId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.contentId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Content: title="${content.title}", contentType=${content.contentType}, status=${content.status}, readiness score=${readiness.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top pre-publish fix. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a content-publish-readiness advisor. Never invent facts about the content not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No content publish or edit beyond the readiness score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No content publish or edit beyond the readiness score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { contentId: params.contentId, score: readiness.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, contentId: params.contentId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
