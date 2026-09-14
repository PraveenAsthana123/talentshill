import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { containsSuspiciousStatistics } from './fabrication-guard';
import { runVoiceCallQualificationPipeline, type VoiceCallQualificationResult } from '@/lib/pipelines/voice-call-qualification-pipeline';
import { getVoiceCallLogById } from '@/lib/db/voice-call-queries';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface VoiceCallAgentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  qualification: VoiceCallQualificationResult;
  summary: string | null;
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

// Real Ollama-backed BANT summary agent -- this is the piece that was
// completely absent from the pre-existing voice_ai module (its only
// Ollama call scores asset metadata completeness, never call/transcript
// content). Summarizes a real, admin-entered call transcript into a
// concise sales-rep-facing recap and recommended next step, grounded
// strictly in what was actually said. Fabrication-guard applied since
// this is open-ended text generation over real but informal transcript
// text, not narration of a single number set.
export async function runVoiceCallQualificationAgent(params: { callId: string; triggeredBy?: string | null }): Promise<VoiceCallAgentResult> {
  const agentRole = 'voice_call_qualification_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'voice_ai',
    operationName: 'agentic_call_qualification_summary',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to turn a real call transcript and its detected BANT signals into a concise sales recap and recommended next step (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a sales-call planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const qualification = await runVoiceCallQualificationPipeline({ callId: params.callId, triggeredBy: params.triggeredBy });
    const call = getVoiceCallLogById(params.callId);
    const detectedSignals = qualification.signals.filter((s) => s.detected).map((s) => s.label);
    const searchOutput = qualification.callId === null
      ? 'Call not found -- cannot summarize.'
      : `Qualification: ${qualification.score}/100 (${qualification.tier}). Detected signals: ${detectedSignals.length ? detectedSignals.join(', ') : 'none'}.`;
    logStep(runId, stepIndex++, 'search', agentRole, 'run qualification pipeline + load transcript', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'run qualification pipeline + load transcript', output: searchOutput, tokensUsed: 0 });

    let summary: string | null = null;
    let fabricationWarning = false;
    if (call) {
      const actInput = `Here is a real call transcript (admin-entered, describing what was actually said on a real sales call):\n${call.transcript}\n\nDetected BANT signals: ${detectedSignals.length ? detectedSignals.join(', ') : 'none'}.\n\nWrite a 3-5 sentence recap for the sales rep: what was discussed, the qualification level, and a recommended next step. Reference only what is actually in the transcript above. Do NOT invent pricing, company names, statistics, or commitments not present in the transcript.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a sales-call qualification assistant. Never invent pricing, statistics, or commitments not present in the transcript -- summarize only what was actually said.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;

      fabricationWarning = containsSuspiciousStatistics(actResult.content);
      summary = fabricationWarning
        ? `[AI GENERATION WARNING: this summary may reference figures not present in the real transcript. Verify before acting on it.]\n\n${actResult.content}`
        : actResult.content;
    } else {
      const noDataMsg = 'Call not found -- nothing to summarize.';
      logStep(runId, stepIndex++, 'act', agentRole, 'call not found', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'call not found', output: noDataMsg, tokensUsed: 0 });
      summary = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No call field changed beyond the pipeline score/rank write', 'Summary is advisory only', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No call field changed beyond the pipeline score/rank write', output: 'Summary is advisory only', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { score: qualification.score, tier: qualification.tier, summary }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, qualification, summary, fabricationWarning };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
