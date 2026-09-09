import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getServiceById } from '@/lib/db/admin-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runServiceContentPipeline } from '@/lib/pipelines/service-content-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ServiceAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; serviceId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent content-improvement loop. "Search" reuses the real
// content-readiness pipeline. "Act" drafts a real, grounded improvement
// suggestion -- never edits the record itself, purely advisory text for
// a human editor.
export async function runServiceContentAgent(params: { serviceId: string; triggeredBy?: string | null }): Promise<ServiceAgentResult> {
  const agentRole = 'service_content_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'services', operationName: 'agentic_content_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const service = getServiceById(params.serviceId);
  if (!service) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'service not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, serviceId: null, recommendation: null };
  }

  try {
    const planInput = `Service page "${service.name}" (category: ${service.category}, active: ${service.isActive}). Plan how to recommend a content improvement (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a marketing-content planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const content = await runServiceContentPipeline({ serviceId: params.serviceId, triggeredBy: params.triggeredBy });
    const failedChecks = content.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Content score: ${content.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.serviceId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.serviceId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Service: name="${service.name}", category=${service.category}, hasIcon=${!!service.icon}, shortDescLength=${(service.shortDesc || '').length}, longDescLength=${(service.longDesc || '').length}, tags=${(service.tags || []).length}, useCases=${(service.useCases || []).length}, content score=${content.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top improvement. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a marketing-content advisor. Never invent facts about the service not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No record edit beyond the content score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No record edit beyond the content score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { serviceId: params.serviceId, score: content.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, serviceId: params.serviceId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
