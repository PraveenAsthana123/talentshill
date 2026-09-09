import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getTemplateById } from '@/lib/db/template-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runTemplateReadinessPipeline } from '@/lib/pipelines/template-readiness-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface TemplateAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; templateId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent template-improvement loop. "Search" reuses the real
// readiness pipeline. "Act" drafts a real, grounded improvement
// suggestion -- never edits the template itself, purely advisory text
// for a human editor.
export async function runTemplateReadinessAgent(params: { templateId: string; triggeredBy?: string | null }): Promise<TemplateAgentResult> {
  const agentRole = 'template_readiness_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'templates', operationName: 'agentic_readiness_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const template = getTemplateById(params.templateId);
  if (!template) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'template not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, templateId: null, recommendation: null };
  }

  try {
    const planInput = `Email template "${template.name}" (category: ${template.category || 'none'}, active: ${template.isActive}). Plan how to recommend a readiness improvement (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are an email-template quality planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const readiness = await runTemplateReadinessPipeline({ templateId: params.templateId, triggeredBy: params.triggeredBy });
    const failedChecks = readiness.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Readiness score: ${readiness.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.templateId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.templateId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Template: name="${template.name}", hasTextFallback=${!!template.textContent}, subjectLength=${template.subject.length}, active=${template.isActive}, readiness score=${readiness.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top improvement. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are an email-template quality advisor. Never invent facts about the template not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No template edit beyond the readiness score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No template edit beyond the readiness score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { templateId: params.templateId, score: readiness.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, templateId: params.templateId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
