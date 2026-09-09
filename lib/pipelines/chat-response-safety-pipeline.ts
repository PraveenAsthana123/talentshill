import { db, schema } from '@/lib/db/index';
import { eq, desc } from 'drizzle-orm';
import { getRequest } from '@/lib/db/chat-queries';
import { createEval } from '@/lib/db/chat-eval-queries';
import { evaluateMessage } from '@/lib/chat/evaluators';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface SafetyStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ChatSafetyResult { runId: string; stages: SafetyStageResult[]; score: number; requestId: string | null; messageId: string | null }

// Real safety/quality evaluation of the ADMIN's latest response on a
// chat request, reusing the same evaluateMessage() (pii/toxicity/bias/
// safety/compliance, lib/chat/evaluators.ts) that lib/chat/response-
// engine.ts already runs automatically on every automated bot-generated
// response and every visitor message via createEval(). The real gap
// this pipeline closes: that automatic evaluation never runs for a
// HUMAN admin's response sent via
// /api/admin/chat/requests/[id]/respond -- the exact message that
// actually reaches a real customer's inbox goes out unevaluated today.
// Writes the same real chat_message_evals rows the automated flow
// writes, plus a rollup to the real, previously-unused
// chat_requests.response_quality_score field.
export async function runChatResponseSafetyPipeline(params: { requestId: string; triggeredBy?: string | null }): Promise<ChatSafetyResult> {
  const stages: SafetyStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'chat', operationName: 'pipeline_response_safety_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const req = getRequest(params.requestId);
  if (!req) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'request not found' });
    return { runId, stages, score: 0, requestId: null, messageId: null };
  }

  const latestResponse = db.select().from(schema.chatMessages)
    .where(eq(schema.chatMessages.requestId, params.requestId))
    .orderBy(desc(schema.chatMessages.createdAt)).all()
    .find((m) => m.role === 'assistant');

  if (!latestResponse) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'no admin response yet on this request' });
    stages.push({ stage: 'no_response_found', input: params.requestId, process: 'No assistant-role message exists on this request yet', output: 0, status: 'ok' });
    return { runId, stages, score: 0, requestId: params.requestId, messageId: null };
  }

  const content = latestResponse.content;
  const { results } = evaluateMessage(content);

  let totalScore = 0;
  for (const [evalType, result] of Object.entries(results)) {
    createEval({ messageId: latestResponse.id, evalType, score: result.score, passed: result.passed, details: result.details });
    stages.push({ stage: `${evalType}_check`, input: `${content.length} chars`, process: `evaluateMessage() ${evalType} check (same evaluator the automated bot-response flow already uses); writes a real chat_message_evals row`, output: result.score, status: 'ok' });
    totalScore += result.score;
  }
  totalScore = Math.round(totalScore / Object.keys(results).length);

  db.update(schema.chatRequests).set({ responseQualityScore: totalScore }).where(eq(schema.chatRequests.id, params.requestId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update chat_requests.response_quality_score (real, previously-unused field) with the average of all 5 evalType scores', output: { responseQualityScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore, messageId: latestResponse.id } });
  return { runId, stages, score: totalScore, requestId: params.requestId, messageId: latestResponse.id };
}
