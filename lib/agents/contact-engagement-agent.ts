import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runContactCompletenessPipeline } from '@/lib/pipelines/contact-completeness-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ContactAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; contactId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent engagement-recommendation loop. "Search" reuses the
// real completeness pipeline. "Act" drafts a real, grounded recommendation
// for how to engage this contact -- never contacts them, never sends
// anything, purely advisory text for a human.
export async function runContactEngagementAgent(params: { contactId: string; triggeredBy?: string | null }): Promise<ContactAgentResult> {
  const agentRole = 'contact_engagement_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'contacts', operationName: 'agentic_engagement_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const contact = db.select().from(schema.contacts).where(eq(schema.contacts.id, params.contactId)).get();
  if (!contact) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'contact not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, contactId: null, recommendation: null };
  }

  try {
    const planInput = `Contact at ${contact.company || 'unknown company'}, source: ${contact.source}, status: ${contact.status}. Plan how to recommend an engagement approach (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a CRM engagement-strategy planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const completeness = runContactCompletenessPipeline({ contactId: params.contactId, triggeredBy: params.triggeredBy });
    const searchOutput = `Completeness/engagement-potential score: ${completeness.score}/100`;
    logStep(runId, stepIndex++, 'search', agentRole, params.contactId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.contactId, output: searchOutput, tokensUsed: 0 });

    let tags: string[] = [];
    try { tags = JSON.parse(contact.tags || '[]'); } catch { /* empty */ }
    const actInput = `Contact: company=${contact.company || 'unknown'}, source=${contact.source}, tags=${tags.join(', ') || 'none'}, status=${contact.status}, completeness score=${completeness.score}/100. In 1-2 sentences, recommend how to engage this contact. If data is too sparse to recommend anything specific, say so.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a CRM engagement advisor. Never invent facts about the contact not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No DB write beyond the completeness score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No DB write beyond the completeness score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { contactId: params.contactId, score: completeness.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, contactId: params.contactId, recommendation: actResult.content };
  } catch (err) {
    // Re-throw (after logging to operation_run) so the API route's 502
    // catch handles it -- returning contactId: null here would make an
    // Ollama timeout look like "contact not found" (404).
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
