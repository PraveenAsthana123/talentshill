import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getWorkflowById } from '@/lib/db/marketing-workflow-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runWorkflowReadinessPipeline } from '@/lib/pipelines/workflow-readiness-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface WorkflowAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; workflowId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent workflow-consistency loop. "Search" reuses the real
// readiness pipeline. "Act" drafts a real, grounded recommendation --
// never changes the workflow's status itself, purely advisory text.
export async function runWorkflowReadinessAgent(params: { workflowId: string; triggeredBy?: string | null }): Promise<WorkflowAgentResult> {
  const agentRole = 'workflow_readiness_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'marketing', operationName: 'agentic_readiness_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const workflow = getWorkflowById(params.workflowId);
  if (!workflow) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'workflow not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, workflowId: null, recommendation: null };
  }

  try {
    const planInput = `Marketing workflow "${workflow.name}" (status: ${workflow.status}, step: ${workflow.currentStep}). Plan how to recommend a consistency fix (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a marketing-workflow consistency planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const readiness = await runWorkflowReadinessPipeline({ workflowId: params.workflowId, triggeredBy: params.triggeredBy });
    const failedChecks = readiness.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Readiness score: ${readiness.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.workflowId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.workflowId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Workflow: name="${workflow.name}", status=${workflow.status}, readiness score=${readiness.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top fix. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a marketing-workflow consistency advisor. Never invent facts about the workflow not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No workflow status change beyond the readiness score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No workflow status change beyond the readiness score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { workflowId: params.workflowId, score: readiness.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, workflowId: params.workflowId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
