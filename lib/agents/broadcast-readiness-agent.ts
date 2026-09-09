import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getBroadcastById } from '@/lib/db/broadcast-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runBroadcastReadinessPipeline } from '@/lib/pipelines/broadcast-readiness-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface BroadcastAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; broadcastId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent broadcast-launch-readiness loop. "Search" reuses the
// real readiness pipeline. "Act" drafts a real, grounded pre-launch
// recommendation -- never launches the broadcast itself, purely advisory
// text for a human sender to act on before clicking Launch.
export async function runBroadcastReadinessAgent(params: { broadcastId: string; triggeredBy?: string | null }): Promise<BroadcastAgentResult> {
  const agentRole = 'broadcast_readiness_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'broadcasts', operationName: 'agentic_readiness_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const broadcast = getBroadcastById(params.broadcastId);
  if (!broadcast) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'broadcast not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, broadcastId: null, recommendation: null };
  }

  try {
    const planInput = `Broadcast "${broadcast.name}" (status: ${broadcast.status}, audienceType: ${broadcast.audienceType}). Plan how to recommend a pre-launch readiness improvement (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a broadcast-launch-readiness planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const readiness = await runBroadcastReadinessPipeline({ broadcastId: params.broadcastId, triggeredBy: params.triggeredBy });
    const failedChecks = readiness.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Readiness score: ${readiness.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.broadcastId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.broadcastId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Broadcast: name="${broadcast.name}", status=${broadcast.status}, audienceType=${broadcast.audienceType}, hasAudienceId=${!!broadcast.audienceId}, hasSenderProfile=${!!broadcast.profileId}, readiness score=${readiness.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top pre-launch fix. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a broadcast-launch-readiness advisor. Never invent facts about the broadcast not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No broadcast launch or edit beyond the readiness score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No broadcast launch or edit beyond the readiness score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { broadcastId: params.broadcastId, score: readiness.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, broadcastId: params.broadcastId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
