import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { containsSuspiciousStatistics } from './fabrication-guard';
import { runChatSalesQualificationPipeline, type ChatQualificationResult } from '@/lib/pipelines/chat-sales-qualification-pipeline';
import { getMessagesForRequest } from '@/lib/db/chat-queries';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ChatSalesAssistantResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  qualification: ChatQualificationResult;
  draftReply: string | null;
  fabricationWarning: boolean;
}

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({
    id: randomUUID(), runId, stepIndex,
    phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete',
    agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now,
  }).run();
}

// Real Ollama-backed conversational-reply drafter -- this is the piece
// that was completely absent from the pre-existing chat module (its
// visitor-facing auto-responder is pure keyword matching, and the only
// existing Ollama call in this module is a QA/tone advisory layer over
// an already-sent human reply). Drafts are grounded strictly in the
// real conversation transcript, never auto-sent -- an admin reviews and
// uses the existing Respond flow to actually send it, same advisory-
// draft discipline as market-research synthesis and campaign variant
// generation. Fabrication-guard applied since this is open-ended text
// generation, not narration of a single number set.
export async function runChatSalesAssistantAgent(params: { requestId: string; triggeredBy?: string | null }): Promise<ChatSalesAssistantResult> {
  const agentRole = 'chat_sales_assistant';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'chat',
    operationName: 'agentic_sales_reply_draft',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to turn a real chat conversation and its detected buying signals into a helpful, grounded draft sales reply (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a sales-conversation planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const qualification = await runChatSalesQualificationPipeline({ requestId: params.requestId, triggeredBy: params.triggeredBy });
    const messages = getMessagesForRequest(params.requestId);
    const transcript = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
    const detectedSignals = qualification.signals.filter((s) => s.detected).map((s) => s.label);
    const searchOutput = qualification.requestId === null
      ? 'Request not found -- cannot draft a reply.'
      : `Conversation has ${messages.length} messages. Qualification: ${qualification.score}/100 (${qualification.tier}). Detected signals: ${detectedSignals.length ? detectedSignals.join(', ') : 'none'}.`;
    logStep(runId, stepIndex++, 'search', agentRole, 'run qualification pipeline + load transcript', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'run qualification pipeline + load transcript', output: searchOutput, tokensUsed: 0 });

    let draftReply: string | null = null;
    let fabricationWarning = false;
    if (qualification.requestId && messages.length > 0) {
      const actInput = `Here is a real conversation with a visitor:\n${transcript}\n\nDetected buying signals: ${detectedSignals.length ? detectedSignals.join(', ') : 'none'}.\n\nDraft a helpful, professional reply from a sales rep to the visitor's most recent message. Reference only what the visitor actually said. Do NOT invent pricing, discounts, delivery dates, specific statistics, or promises not already established. This is a draft for human review before sending, not a final message.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a sales-conversation assistant. Never invent pricing, discounts, dates, statistics, or promises not present in the conversation -- write a grounded, helpful draft only.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;

      fabricationWarning = containsSuspiciousStatistics(actResult.content);
      draftReply = fabricationWarning
        ? `[AI GENERATION WARNING: this draft may reference pricing/figures not present in the real conversation. Verify before sending.]\n\n${actResult.content}`
        : actResult.content;
    } else {
      const noDataMsg = 'No messages in this conversation yet -- nothing to draft a reply to.';
      logStep(runId, stepIndex++, 'act', agentRole, 'no messages', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'no messages', output: noDataMsg, tokensUsed: 0 });
      draftReply = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No message sent -- draft is advisory only', 'Admin must review and send via the existing Respond flow', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No message sent -- draft is advisory only', output: 'Admin must review and send via the existing Respond flow', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { score: qualification.score, tier: qualification.tier, draftReply }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, qualification, draftReply, fabricationWarning };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
