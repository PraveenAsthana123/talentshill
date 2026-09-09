import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runContentOverrideSafetyPipeline } from '@/lib/pipelines/content-override-safety-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface OverrideAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; overrideId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent override-safety loop. "Search" reuses the real
// safety pipeline. "Act" drafts a real, grounded recommendation --
// never edits or toggles the override itself, purely advisory text.
export async function runContentOverrideSafetyAgent(params: { overrideId: string; triggeredBy?: string | null }): Promise<OverrideAgentResult> {
  const agentRole = 'content_override_safety_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'content_overrides', operationName: 'agentic_safety_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const override = db.select().from(schema.contentOverrides).where(eq(schema.contentOverrides.id, params.overrideId)).get();
  if (!override) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'override not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, overrideId: null, recommendation: null };
  }

  try {
    const planInput = `Content override for page="${override.pageSlug}", section="${override.section}", key="${override.key}" (active: ${override.isActive}). Plan how to recommend a safety improvement (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a content-override safety planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const safety = await runContentOverrideSafetyPipeline({ overrideId: params.overrideId, triggeredBy: params.triggeredBy });
    const failedChecks = safety.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Safety score: ${safety.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.overrideId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.overrideId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Override: page=${override.pageSlug}, section=${override.section}, key=${override.key}, active=${override.isActive}, safety score=${safety.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top fix. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a content-override safety advisor. Never invent facts about the override not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No override edit beyond the safety score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No override edit beyond the safety score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { overrideId: params.overrideId, score: safety.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, overrideId: params.overrideId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
