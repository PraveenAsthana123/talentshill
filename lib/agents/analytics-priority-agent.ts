import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runAnalyticsHealthPipeline } from '@/lib/pipelines/analytics-health-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface AnalyticsAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent program-improvement loop. "Search" reuses the real
// health pipeline (open/click/bounce rate vs. disclosed benchmarks, plus
// contact-base health). "Act" drafts a real, grounded recommendation on
// the single biggest lever to improve -- advisory only, never edits any
// campaign or contact record.
export async function runAnalyticsPriorityAgent(params: { triggeredBy?: string | null }): Promise<AnalyticsAgentResult> {
  const agentRole = 'analytics_priority_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'analytics', operationName: 'agentic_priority_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  try {
    const planInput = 'Plan how to identify the single biggest lever to improve email-program performance from open rate, click rate, bounce rate, and contact-base health (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a marketing-analytics prioritization planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const health = await runAnalyticsHealthPipeline({ triggeredBy: params.triggeredBy });
    const weakest = health.stages.filter((s) => s.stage !== 'write_snapshot').sort((a, b) => (a.output as number) - (b.output as number))[0];
    const searchOutput = `Program health score: ${health.score}/100. Weakest area: ${weakest?.stage} (${weakest?.output}). Full breakdown: ${health.stages.filter((s) => s.stage !== 'write_snapshot').map((s) => `${s.stage}=${s.output}`).join(', ')}.`;
    logStep(runId, stepIndex++, 'search', agentRole, 'program health snapshot', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'program health snapshot', output: searchOutput, tokensUsed: 0 });

    const actInput = `Email program health score=${health.score}/100. Breakdown: ${health.stages.filter((s) => s.stage !== 'write_snapshot').map((s) => `${s.stage}=${s.output}`).join(', ')}. Weakest area: ${weakest?.stage}. In 1-2 sentences, recommend the single biggest lever to improve. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are an email-marketing-program advisor. Never invent facts about performance not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No campaign/contact edit beyond the snapshot already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No campaign/contact edit beyond the snapshot already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { score: health.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
