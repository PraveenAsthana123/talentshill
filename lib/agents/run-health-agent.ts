import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getRun } from '@/lib/db/run-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runRunHealthPipeline } from '@/lib/pipelines/run-health-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface RunHealthAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; targetRunId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent run-health loop. "Search" reuses the real health
// pipeline. "Act" drafts a real, grounded recommendation -- never
// force-changes a run's status itself, purely advisory text (an admin
// still uses the Manual tab's Force Status action deliberately).
export async function runRunHealthAgent(params: { targetRunId: string; triggeredBy?: string | null }): Promise<RunHealthAgentResult> {
  const agentRole = 'run_health_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'runs', operationName: 'agentic_health_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const target = getRun(params.targetRunId);
  if (!target) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'run not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, targetRunId: null, recommendation: null };
  }

  try {
    const planInput = `Run "${target.name}" (type: ${target.type}, status: ${target.status}). Plan how to recommend a health fix if needed (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a run-health planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const health = await runRunHealthPipeline({ targetRunId: params.targetRunId, triggeredBy: params.triggeredBy });
    const failedChecks = health.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Health score: ${health.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.targetRunId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.targetRunId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Run: name="${target.name}", type=${target.type}, status=${target.status}, health score=${health.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top fix. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a run-health advisor. Never invent facts about the run not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No run status change beyond the health score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No run status change beyond the health score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { targetRunId: params.targetRunId, score: health.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, targetRunId: params.targetRunId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
