import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runInfluencerRoiPipeline, type InfluencerRoiResult } from '@/lib/pipelines/influencer-roi-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface InfluencerRoiAgentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  pipelineResult: InfluencerRoiResult;
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

// Same honesty pattern as ad-budget-optimization-agent.ts: the pipeline
// computes every number first; the LLM only narrates real computed
// figures and is explicitly told never to invent a creator/number.
export async function runInfluencerRoiAgent(params: { triggeredBy?: string | null }): Promise<InfluencerRoiAgentResult> {
  const agentRole = 'influencer_roi_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'influencer_video',
    operationName: 'agentic_roi_scoring',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to turn a computed per-creator ROI/renewal table into a short prioritized narrative (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are an influencer-ROI planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const pipelineResult = await runInfluencerRoiPipeline({ triggeredBy: params.triggeredBy });
    const searchOutput = `${pipelineResult.scoredCreators} scored creators, ${pipelineResult.unscoredCreators} with no metrics/fee. Suggestions: ${JSON.stringify(pipelineResult.suggestions)}`;
    logStep(runId, stepIndex++, 'search', agentRole, 'run deterministic ROI pipeline', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'run deterministic ROI pipeline', output: searchOutput, tokensUsed: 0 });

    let narrative: string | null = null;
    if (pipelineResult.suggestions.length > 0) {
      const table = pipelineResult.suggestions
        .map((s) => `- ${s.influencerName} (${s.platform}): action=${s.action}, ROI=${s.roi === null ? 'no data' : (s.roi * 100).toFixed(0) + '%'}, reason="${s.reason}"`)
        .join('\n');
      const actInput = `Here is a computed creator-renewal table for real influencer campaigns. Write a 3-5 sentence prioritized narrative for a marketing manager, referencing only these names and numbers. Never invent a creator, number, or metric not listed below.\n\n${table}`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are an influencer-ROI advisor. Never invent facts, creators, or numbers not given to you in the input.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;
      narrative = actResult.content;
    } else {
      const noDataMsg = 'No creators have real metric entries and an agreed fee yet -- nothing to score. Log reach/clicks/sales/revenue via the Manual tab first.';
      logStep(runId, stepIndex++, 'act', agentRole, 'no scored creators', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'no scored creators', output: noDataMsg, tokensUsed: 0 });
      narrative = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No campaign field changed', 'Renewal suggestions are advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No campaign field changed', output: 'Renewal suggestions are advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', {
      outputPayload: { scoredCreators: pipelineResult.scoredCreators, suggestionCount: pipelineResult.suggestions.length, narrative },
      tokensUsed: totalTokens,
    });

    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, pipelineResult, narrative };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
