import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runBrandHealthPipeline, computeCampaignLift, type BrandHealthResult } from '@/lib/pipelines/brand-health-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface BrandHealthAgentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  pipelineResult: BrandHealthResult;
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

export async function runBrandHealthAgent(params: { label?: string; campaignId?: string; triggeredBy?: string | null }): Promise<BrandHealthAgentResult> {
  const agentRole = 'brand_health_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'branding',
    operationName: 'agentic_brand_health_narrative',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to turn a computed brand-health snapshot (score, sentiment breakdown, competitor context) into a short strategic narrative (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a brand-strategy planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const pipelineResult = await runBrandHealthPipeline({ label: params.label, campaignId: params.campaignId, triggeredBy: params.triggeredBy });
    const lift = params.campaignId ? computeCampaignLift(params.campaignId) : null;
    const searchOutput = `Health score: ${pipelineResult.healthScore ?? 'no data'}. Sentiment: ${pipelineResult.positiveMentions} positive, ${pipelineResult.neutralMentions} neutral, ${pipelineResult.negativeMentions} negative (${pipelineResult.scoredMentions} scored of ${pipelineResult.totalMentions} total). Competitors tracked: ${pipelineResult.competitorsTracked}.${lift ? ` Campaign lift: ${lift.lift ?? 'not yet measurable (need a post-campaign snapshot)'}` : ''}`;
    logStep(runId, stepIndex++, 'search', agentRole, 'run deterministic health pipeline', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'run deterministic health pipeline', output: searchOutput, tokensUsed: 0 });

    let narrative: string | null = null;
    if (pipelineResult.healthScore !== null) {
      const actInput = `Here is a real, computed brand-health snapshot:\n${searchOutput}\n\nWrite a 3-5 sentence strategic narrative for a brand manager, referencing only these real numbers. Never invent a mention, competitor, or number not given above.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a brand-health advisor. Never invent facts, mentions, or numbers not given to you in the input.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;
      narrative = actResult.content;
    } else {
      const noDataMsg = 'No scored mentions yet -- log real mentions and run sentiment analysis via the Manual/Agentic tabs first.';
      logStep(runId, stepIndex++, 'act', agentRole, 'no scored mentions', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'no scored mentions', output: noDataMsg, tokensUsed: 0 });
      narrative = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No mention field changed beyond the snapshot write', 'Narrative is advisory only', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No mention field changed beyond the snapshot write', output: 'Narrative is advisory only', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { healthScore: pipelineResult.healthScore, narrative }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, pipelineResult, narrative };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
