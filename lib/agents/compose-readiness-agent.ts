import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runComposeReadinessPipeline } from '@/lib/pipelines/compose-readiness-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ComposeAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent pre-send loop. "Search" reuses the real readiness
// pipeline. "Act" drafts a real, grounded recommendation -- never sends
// the email itself, purely advisory text before a human clicks Send.
export async function runComposeReadinessAgent(params: { to: string; subject: string; html: string; profileId?: string; triggeredBy?: string | null }): Promise<ComposeAgentResult> {
  const agentRole = 'compose_readiness_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'email_compose', operationName: 'agentic_readiness_recommendation', executionMode: 'agentic', status: 'running', inputPayload: { to: params.to, subject: params.subject }, triggeredBy: params.triggeredBy });

  try {
    const planInput = `Draft email to "${params.to}" with subject "${params.subject}". Plan how to recommend a pre-send readiness improvement (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are an email pre-send readiness planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const readiness = await runComposeReadinessPipeline({ to: params.to, subject: params.subject, html: params.html, profileId: params.profileId, triggeredBy: params.triggeredBy });
    const failedChecks = readiness.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Readiness score: ${readiness.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.to, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.to, output: searchOutput, tokensUsed: 0 });

    const actInput = `Draft email: to=${params.to}, subject="${params.subject}", readiness score=${readiness.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top pre-send fix. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are an email pre-send readiness advisor. Never invent facts about the draft not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No email sent beyond the readiness log already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No email sent beyond the readiness log already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { score: readiness.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
