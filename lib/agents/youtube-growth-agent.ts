import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { containsSuspiciousStatistics } from './fabrication-guard';
import { runChannelGrowthPipeline, type ChannelGrowthResult } from '@/lib/pipelines/youtube-channel-growth-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface YoutubeGrowthAgentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  growth: ChannelGrowthResult;
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

// Real Ollama-backed channel-growth narrative -- runs the real growth
// pipeline as its search step, then drafts a short strategic recap
// referencing only the real computed subscriber/view deltas. Includes
// a qualitative recommendation, which is open-ended enough that the
// shared fabrication-guard backstop is applied (same discipline as
// brand-health-agent.ts's peers in this session that combine real-
// number narration with a recommendation).
export async function runYoutubeGrowthAgent(params: { triggeredBy?: string | null } = {}): Promise<YoutubeGrowthAgentResult> {
  const agentRole = 'youtube_channel_growth_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'youtube',
    operationName: 'agentic_channel_growth_narrative',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to turn a real computed channel-growth delta (subscriber/view/watch-time diffs between two real snapshots) into a short strategic recap (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a YouTube channel-growth planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const growth = await runChannelGrowthPipeline({ triggeredBy: params.triggeredBy });
    const searchOutput = !growth.hasEnoughData
      ? 'Fewer than 2 real channel snapshots exist -- no growth delta can be computed yet.'
      : `Over ${growth.delta!.daysBetween} real days: subscribers ${growth.delta!.subscriberDelta >= 0 ? '+' : ''}${growth.delta!.subscriberDelta}, views ${growth.delta!.viewsDelta >= 0 ? '+' : ''}${growth.delta!.viewsDelta}${growth.delta!.watchTimeMinutesDelta !== null ? `, watch time ${growth.delta!.watchTimeMinutesDelta >= 0 ? '+' : ''}${growth.delta!.watchTimeMinutesDelta}min` : ''}${growth.delta!.subscribersPerDay !== null ? ` (${growth.delta!.subscribersPerDay}/day)` : ''}.`;
    logStep(runId, stepIndex++, 'search', agentRole, 'run real channel growth pipeline', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'run real channel growth pipeline', output: searchOutput, tokensUsed: 0 });

    let narrative: string | null = null;
    let fabricationWarning = false;
    if (growth.hasEnoughData) {
      const actInput = `Real channel growth data:\n${searchOutput}\n\nWrite a 3-4 sentence strategic recap and one qualitative recommendation, referencing only these real numbers. Do not invent a specific new subscriber/view number, percentage, or date not given above.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a YouTube channel-growth advisor. Never invent numbers, percentages, or dates not given to you in the input.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;

      fabricationWarning = containsSuspiciousStatistics(actResult.content);
      narrative = fabricationWarning
        ? `[AI GENERATION WARNING: this recap may reference figures not present in the real growth data above. Verify before acting on it.]\n\n${actResult.content}`
        : actResult.content;
    } else {
      const noDataMsg = 'Log at least 2 real channel snapshots (Manual tab) to compute a real growth delta.';
      logStep(runId, stepIndex++, 'act', agentRole, 'insufficient snapshots', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'insufficient snapshots', output: noDataMsg, tokensUsed: 0 });
      narrative = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No snapshot written -- narrative is advisory only', 'Narrative is advisory only', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No snapshot written -- narrative is advisory only', output: 'Narrative is advisory only', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { hasEnoughData: growth.hasEnoughData, narrative }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, growth, narrative, fabricationWarning };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
