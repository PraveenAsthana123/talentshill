import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getMediaById } from '@/lib/db/media-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runMediaIntegrityPipeline } from '@/lib/pipelines/media-integrity-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface MediaAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; mediaId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent file-integrity loop. "Search" reuses the real
// integrity pipeline. "Act" drafts a real, grounded recommendation --
// never deletes or edits the media record itself, purely advisory
// text.
export async function runMediaIntegrityAgent(params: { mediaId: string; triggeredBy?: string | null }): Promise<MediaAgentResult> {
  const agentRole = 'media_integrity_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'media', operationName: 'agentic_integrity_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const item = getMediaById(params.mediaId);
  if (!item) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'media not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, mediaId: null, recommendation: null };
  }

  try {
    const planInput = `Media file "${item.originalName}" (${item.mimeType}, ${item.size} bytes). Plan how to recommend a file-integrity fix if needed (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a media-file integrity planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const integrity = await runMediaIntegrityPipeline({ mediaId: params.mediaId, triggeredBy: params.triggeredBy });
    const failedChecks = integrity.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Integrity score: ${integrity.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.mediaId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.mediaId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Media file: name="${item.originalName}", integrity score=${integrity.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top fix. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a media-file integrity advisor. Never invent facts about the file not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No media edit or delete beyond the readiness score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No media edit or delete beyond the readiness score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { mediaId: params.mediaId, score: integrity.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, mediaId: params.mediaId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
