import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runLeadScoringPipeline } from '@/lib/pipelines/lead-scoring-pipeline';

export interface AgentStepRecord {
  phase: 'plan' | 'search' | 'act' | 'execute' | 'complete';
  agentRole: string;
  input: string;
  output: string;
  tokensUsed: number;
}

export interface LeadAgentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  submissionId: string | null;
  qualificationNarrative: string | null;
}

function logStep(runId: string, stepIndex: number, phase: AgentStepRecord['phase'], agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({
    id: randomUUID(), runId, stepIndex, phase, agentRole, input, output, tokensUsed,
    startedAt: now, completedAt: now, createdAt: now,
  }).run();
}

// Real single-agent loop for lead qualification. "Search" here reuses the
// real deterministic scoring pipeline (not a web search -- there's no
// external source to search for an internal lead submission); the agent's
// value-add is drafting a human-readable qualification narrative from the
// real submission + real score, not recomputing the score itself.
export async function runLeadQualificationAgent(params: { submissionId: string; triggeredBy?: string | null }): Promise<LeadAgentResult> {
  const agentRole = 'lead_qualifier';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'leads',
    operationName: 'agentic_qualify_lead',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const submission = db.select().from(schema.contactSubmissions).where(eq(schema.contactSubmissions.id, params.submissionId)).get();
  if (!submission) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'submission not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, submissionId: null, qualificationNarrative: null };
  }

  try {
    // PLAN
    const planInput = `Lead from ${submission.company} (${submission.industry}), stage: ${submission.projectStage}, timeline: ${submission.timeline}. Plan how to assess whether this is a strong lead (max 3 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a lead-qualification planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    // SEARCH -- reuse the real deterministic scoring pipeline as the
    // "data-gathering" step (there's no external source to search for an
    // internal submission).
    const scoringResult = runLeadScoringPipeline({ submissionId: params.submissionId, triggeredBy: params.triggeredBy });
    const searchOutput = `Deterministic score: ${scoringResult.score}/100, tier: ${scoringResult.tier}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.submissionId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.submissionId, output: searchOutput, tokensUsed: 0 });

    // ACT -- real LLM call drafting a qualification narrative from real data
    const actInput = `Lead details:\nCompany: ${submission.company}\nIndustry: ${submission.industry}\nStage: ${submission.projectStage}\nBudget: ${submission.budgetRange || '(not provided)'}\nTimeline: ${submission.timeline}\nMessage: ${submission.message}\nDeterministic score: ${scoringResult.score}/100 (${scoringResult.tier})\n\nDraft a 2-3 sentence qualification narrative explaining whether/why this is a strong lead, using only the real data above. Do not invent facts not present.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a lead-qualification analysis agent. Never invent facts not in the provided data.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    // EXECUTE -- the score was already written by the pipeline call above;
    // the narrative itself is stored in this run's outputPayload (no
    // schema change to contact_submissions for a draft narrative field).
    logStep(runId, stepIndex++, 'execute', agentRole, 'Narrative stored in operation_run.outputPayload', `Score already written: ${scoringResult.score}/${scoringResult.tier}`, 0);
    steps.push({ phase: 'execute', agentRole, input: 'Narrative stored in operation_run.outputPayload', output: `Score already written: ${scoringResult.score}/${scoringResult.tier}`, tokensUsed: 0 });

    // COMPLETE
    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', {
      outputPayload: { submissionId: params.submissionId, score: scoringResult.score, tier: scoringResult.tier, narrative: actResult.content },
      tokensUsed: totalTokens,
    });

    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, submissionId: params.submissionId, qualificationNarrative: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, submissionId: null, qualificationNarrative: null };
  }
}
