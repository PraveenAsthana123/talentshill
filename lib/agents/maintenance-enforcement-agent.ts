import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runMaintenanceEnforcementPipeline } from '@/lib/pipelines/maintenance-enforcement-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface MaintenanceAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent enforcement-verification loop. "Search" reuses the
// real self-test pipeline (a real live HTTP check, not a simulated
// one). "Act" drafts a real, grounded recommendation -- never toggles
// maintenance mode itself, purely advisory text.
export async function runMaintenanceEnforcementAgent(params: { requestOrigin: string; triggeredBy?: string | null }): Promise<MaintenanceAgentResult> {
  const agentRole = 'maintenance_enforcement_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'maintenance', operationName: 'agentic_enforcement_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  try {
    const planInput = 'Plan how to verify that maintenance-mode enforcement (a real middleware check against a live public page) is behaving correctly (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a site-operations verification planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const check = await runMaintenanceEnforcementPipeline({ requestOrigin: params.requestOrigin, triggeredBy: params.triggeredBy });
    const failedChecks = check.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_check').map((s) => s.stage);
    const searchOutput = `Enforcement check score: ${check.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.requestOrigin, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.requestOrigin, output: searchOutput, tokensUsed: 0 });

    const actInput = `Maintenance enforcement check score=${check.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top fix if any, or confirm enforcement is working. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a site-operations advisor. Never invent facts about the check not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No maintenance-mode toggle beyond the real check already performed', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No maintenance-mode toggle beyond the real check already performed', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { score: check.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
