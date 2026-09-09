import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getAppointmentById } from '@/lib/appointments-db';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runAppointmentFollowupPipeline } from '@/lib/pipelines/appointment-followup-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface AppointmentAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; appointmentId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent follow-up-recommendation loop. "Search" reuses the
// real urgency pipeline. "Act" drafts a real, grounded next-step
// recommendation for staff -- never confirms/cancels/contacts anyone,
// purely advisory text for a human to act on.
export async function runAppointmentFollowupAgent(params: { appointmentId: string; triggeredBy?: string | null }): Promise<AppointmentAgentResult> {
  const agentRole = 'appointment_followup_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'appointments', operationName: 'agentic_followup_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const appointment = getAppointmentById(params.appointmentId);
  if (!appointment) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'appointment not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, appointmentId: null, recommendation: null };
  }

  try {
    const planInput = `Booking for ${appointment.service.service} (${appointment.service.category}), status: ${appointment.status}, tier: ${appointment.leadTier}. Plan how to recommend a follow-up action (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a booking follow-up planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const urgency = runAppointmentFollowupPipeline({ appointmentId: params.appointmentId, triggeredBy: params.triggeredBy });
    const searchOutput = `Follow-up urgency score: ${urgency.score}/100`;
    logStep(runId, stepIndex++, 'search', agentRole, params.appointmentId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.appointmentId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Booking: service=${appointment.service.service}, status=${appointment.status}, tier=${appointment.leadTier}, budget=${appointment.requirements.budget}, timeline=${appointment.requirements.timeline}, urgency score=${urgency.score}/100. In 1-2 sentences, recommend the next follow-up action for staff. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a booking follow-up advisor. Never invent facts about the booking not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No status change beyond the urgency score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No status change beyond the urgency score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { appointmentId: params.appointmentId, score: urgency.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, appointmentId: params.appointmentId, recommendation: actResult.content };
  } catch (err) {
    // Re-throw (after logging to operation_run) so the API route's 502
    // catch handles it -- returning appointmentId: null here would make
    // an Ollama timeout look like "appointment not found" (404).
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
