import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runAdBudgetOptimizationPipeline, type AdBudgetOptimizationResult } from '@/lib/pipelines/ad-budget-optimization-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface AdBudgetOptimizationAgentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  pipelineResult: AdBudgetOptimizationResult;
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

// Same honesty pattern as ad-campaign-readiness-agent.ts: the deterministic
// pipeline computes every number first; the LLM only turns already-computed,
// real per-campaign figures into a plain-language narrative and is
// explicitly told never to invent a number it wasn't given. It writes
// nothing back to the DB -- the reallocation suggestions are advisory.
export async function runAdBudgetOptimizationAgent(params: { triggeredBy?: string | null }): Promise<AdBudgetOptimizationAgentResult> {
  const agentRole = 'ad_budget_optimization_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'ads_management',
    operationName: 'agentic_budget_optimization',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to turn a computed per-campaign budget-reallocation table into a short prioritized narrative (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a budget-optimization planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const pipelineResult = await runAdBudgetOptimizationPipeline({ triggeredBy: params.triggeredBy });
    const searchOutput = `${pipelineResult.scoredCampaigns} scored campaigns, ${pipelineResult.unscoredCampaigns} with no metric data. Suggestions: ${JSON.stringify(pipelineResult.suggestions)}`;
    logStep(runId, stepIndex++, 'search', agentRole, 'run deterministic pipeline', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'run deterministic pipeline', output: searchOutput, tokensUsed: 0 });

    let narrative: string | null = null;
    if (pipelineResult.suggestions.length > 0) {
      const table = pipelineResult.suggestions
        .map((s) => `- ${s.name} (${s.platform}): action=${s.action} ${s.suggestedDeltaPct}%, ROAS=${s.roas === null ? 'no data' : s.roas.toFixed(2)}, reason="${s.reason}"`)
        .join('\n');
      const actInput = `Here is a computed budget-reallocation table for real ad campaigns. Write a 3-5 sentence prioritized narrative for a marketing manager, referencing only these numbers and names. Never invent a campaign, number, or metric not listed below.\n\n${table}`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are an ad-budget optimization advisor. Never invent facts, campaigns, or numbers not given to you in the input.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;
      narrative = actResult.content;
    } else {
      const noDataMsg = 'No campaigns have real metric entries yet -- nothing to optimize. Log impressions/clicks/conversions/revenue via the Manual tab first.';
      logStep(runId, stepIndex++, 'act', agentRole, 'no scored campaigns', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'no scored campaigns', output: noDataMsg, tokensUsed: 0 });
      narrative = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No campaign field changed', 'Reallocation suggestions are advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No campaign field changed', output: 'Reallocation suggestions are advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', {
      outputPayload: { scoredCampaigns: pipelineResult.scoredCampaigns, suggestionCount: pipelineResult.suggestions.length, narrative },
      tokensUsed: totalTokens,
    });

    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, pipelineResult, narrative };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
