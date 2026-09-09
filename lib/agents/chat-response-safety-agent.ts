import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getRequest } from '@/lib/db/chat-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runChatResponseSafetyPipeline } from '@/lib/pipelines/chat-response-safety-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ChatAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; requestId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent response-quality loop. "Search" reuses the real
// safety pipeline (pii/toxicity/compliance). "Act" drafts a real,
// grounded tone/professionalism note -- advisory only, never edits or
// re-sends the response.
export async function runChatResponseSafetyAgent(params: { requestId: string; triggeredBy?: string | null }): Promise<ChatAgentResult> {
  const agentRole = 'chat_response_safety_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'chat', operationName: 'agentic_response_quality_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const req = getRequest(params.requestId);
  if (!req) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'request not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, requestId: null, recommendation: null };
  }

  try {
    const planInput = `Chat request "${req.subject || 'no subject'}" (status: ${req.status}, priority: ${req.priority}). Plan how to assess the admin's latest response for tone and professionalism (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a support-response quality planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const safety = await runChatResponseSafetyPipeline({ requestId: params.requestId, triggeredBy: params.triggeredBy });
    if (!safety.messageId) {
      const searchOutput = 'No admin response exists yet on this request.';
      logStep(runId, stepIndex++, 'search', agentRole, params.requestId, searchOutput, 0);
      steps.push({ phase: 'search', agentRole, input: params.requestId, output: searchOutput, tokensUsed: 0 });
      logStep(runId, stepIndex++, 'complete', agentRole, '', 'Run complete, no response to evaluate', 0);
      steps.push({ phase: 'complete', agentRole, input: '', output: 'Run complete, no response to evaluate', tokensUsed: 0 });
      updateOperationRunStatus(runId, 'completed', { outputPayload: { requestId: params.requestId, note: 'no response yet' } });
      return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, requestId: params.requestId, recommendation: null };
    }
    const failedChecks = safety.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Response quality score: ${safety.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.requestId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.requestId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Chat request status=${req.status}, priority=${req.priority}, response quality score=${safety.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top fix before this response is considered final. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a support-response quality advisor. Never invent facts about the response not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No message edit or resend beyond the score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No message edit or resend beyond the score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { requestId: params.requestId, score: safety.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, requestId: params.requestId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
