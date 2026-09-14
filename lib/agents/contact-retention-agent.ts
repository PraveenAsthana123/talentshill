import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runContactActivationPipeline, type ContactActivationResult } from '@/lib/pipelines/contact-activation-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ContactRetentionAgentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  pipelineResult: ContactActivationResult;
  narrative: string | null;
}

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({
    id: randomUUID(), runId, stepIndex,
    phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete',
    agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now,
  }).run();
}

// Distinct from the pre-existing contact-engagement-agent.ts (which
// narrates the static profile-completeness score, contacts.leadScore).
// This agent narrates the real behavioral lifecycle distribution
// computed by contact-activation-pipeline.ts -- agentRole is
// deliberately named differently to avoid reading as a duplicate of
// the existing agent.
export async function runContactRetentionAgent(params: { triggeredBy?: string | null }): Promise<ContactRetentionAgentResult> {
  const agentRole = 'contact_retention_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'contacts',
    operationName: 'agentic_retention_narrative',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to turn a computed contact-lifecycle distribution (new/engaged/at_risk/churned counts) into a short retention-strategy narrative (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a lifecycle-marketing planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const pipelineResult = await runContactActivationPipeline({ triggeredBy: params.triggeredBy });
    const searchOutput = `${pipelineResult.totalContacts} contacts scored. Distribution: ${JSON.stringify(pipelineResult.byStage)}`;
    logStep(runId, stepIndex++, 'search', agentRole, 'run deterministic activation pipeline', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'run deterministic activation pipeline', output: searchOutput, tokensUsed: 0 });

    let narrative: string | null = null;
    if (pipelineResult.totalContacts > 0) {
      const actInput = `Here is the real contact lifecycle distribution for ${pipelineResult.totalContacts} contacts: ${JSON.stringify(pipelineResult.byStage)}. Write a 3-5 sentence retention-strategy narrative for a marketing manager, referencing only these real counts. Never invent a contact name or number not given below.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a lifecycle-marketing retention advisor. Never invent facts, contacts, or numbers not given to you in the input.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;
      narrative = actResult.content;
    } else {
      const noDataMsg = 'No contacts exist yet -- nothing to score.';
      logStep(runId, stepIndex++, 'act', agentRole, 'no contacts', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'no contacts', output: noDataMsg, tokensUsed: 0 });
      narrative = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No contact field changed beyond the activation pipeline write', 'Narrative is advisory only', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No contact field changed beyond the activation pipeline write', output: 'Narrative is advisory only', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { totalContacts: pipelineResult.totalContacts, byStage: pipelineResult.byStage, narrative }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, pipelineResult, narrative };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
