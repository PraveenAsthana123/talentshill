import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runModuleRegistryDriftPipeline } from '@/lib/pipelines/module-registry-drift-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ModuleRegistryAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; moduleRegistryId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent registry-drift loop. "Search" reuses the real
// drift pipeline. "Act" drafts a real, grounded recommendation --
// never edits the registry entry itself beyond the drift score already
// written, purely advisory text.
export async function runModuleRegistryDriftAgent(params: { moduleRegistryId: string; triggeredBy?: string | null }): Promise<ModuleRegistryAgentResult> {
  const agentRole = 'module_registry_drift_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'module-registry', operationName: 'agentic_drift_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const item = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.id, params.moduleRegistryId)).get();
  if (!item) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'module registry entry not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, moduleRegistryId: null, recommendation: null };
  }

  try {
    const planInput = `Module registry entry "${item.name}" (status: ${item.builtStatus}). Plan how to recommend a registry-drift fix if needed (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a module-registry drift planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const drift = await runModuleRegistryDriftPipeline({ moduleRegistryId: params.moduleRegistryId, triggeredBy: params.triggeredBy });
    const failedChecks = drift.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Drift score: ${drift.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.moduleRegistryId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.moduleRegistryId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Module: name="${item.name}", drift score=${drift.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top fix. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a module-registry drift advisor. Never invent facts about the module not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No registry entry edit beyond the drift score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No registry entry edit beyond the drift score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { moduleRegistryId: params.moduleRegistryId, score: drift.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, moduleRegistryId: params.moduleRegistryId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
