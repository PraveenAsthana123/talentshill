import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { containsSuspiciousStatistics } from './fabrication-guard';
import { runMarketOpportunityScoringPipeline, type OpportunityScoringResult } from '@/lib/pipelines/market-opportunity-scoring-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface MarketOpportunityAgentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  pipelineResult: OpportunityScoringResult;
  narrative: string | null;
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

// Compares real, already-scored/ranked briefs and drafts a
// recommendation narrative. Unlike brand-health-agent.ts (pure
// narration of a single number set), this agent reasons across
// multiple real briefs and their SOM dollar figures -- open-ended
// enough that the shared fabrication-guard backstop applies, the same
// discipline used for content-generation-agent.ts after phi4-mini was
// caught fabricating statistics in use case 4.
export async function runMarketOpportunityScoringAgent(params: { triggeredBy?: string | null } = {}): Promise<MarketOpportunityAgentResult> {
  const agentRole = 'market_opportunity_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'market_research',
    operationName: 'agentic_opportunity_recommendation',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to turn a real, deterministically-computed ranked list of market opportunities into a short recommendation narrative (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a market-strategy planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const pipelineResult = await runMarketOpportunityScoringPipeline({ triggeredBy: params.triggeredBy });
    const top = pipelineResult.ranked.slice(0, 5);
    const searchOutput = pipelineResult.scoredCount === 0
      ? `No briefs are scorable yet (${pipelineResult.skippedCount} briefs missing SOM estimate/competition/risk/strategic-fit inputs).`
      : `Scored ${pipelineResult.scoredCount} briefs (${pipelineResult.skippedCount} skipped, missing real inputs). Top ranked: ${top.map((t) => `#${t.opportunityRank} "${t.title}" (score ${t.opportunityScore}/100)`).join('; ')}.`;
    logStep(runId, stepIndex++, 'search', agentRole, 'run deterministic opportunity scoring pipeline', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'run deterministic opportunity scoring pipeline', output: searchOutput, tokensUsed: 0 });

    let narrative: string | null = null;
    let fabricationWarning = false;
    if (pipelineResult.scoredCount > 0) {
      const actInput = `Here is a real, deterministically-computed ranking of market-research opportunities:\n${searchOutput}\n\nWrite a 3-5 sentence recommendation for which opportunity(ies) to prioritize, referencing only the titles/ranks/scores given above. Do not invent market sizes, competitor names, or any figure not given above.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a market-opportunity advisor. Never invent market sizes, competitors, or numbers not given to you in the input.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;

      fabricationWarning = containsSuspiciousStatistics(actResult.content);
      narrative = fabricationWarning
        ? `[AI GENERATION WARNING: this narrative may reference figures not present in the real scoring data above. Verify before acting on it.]\n\n${actResult.content}`
        : actResult.content;
    } else {
      const noDataMsg = 'No briefs have complete opportunity-scoring inputs yet -- enter SOM estimate, competition level, risk level, and strategic fit score for at least one brief via the Manual tab first.';
      logStep(runId, stepIndex++, 'act', agentRole, 'no scorable briefs', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'no scorable briefs', output: noDataMsg, tokensUsed: 0 });
      narrative = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No brief field changed beyond the pipeline score/rank write', 'Narrative is advisory only', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No brief field changed beyond the pipeline score/rank write', output: 'Narrative is advisory only', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { scoredCount: pipelineResult.scoredCount, narrative }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, pipelineResult, narrative, fabricationWarning };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
