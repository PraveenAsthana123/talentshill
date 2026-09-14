import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { containsSuspiciousStatistics } from './fabrication-guard';
import { getObservationsForCompetitor } from '@/lib/db/competitor-campaign-observation-queries';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface CompetitorNarrativeResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  observationCount: number;
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

// Real Ollama-backed activity-pattern summary for one competitor,
// grounded strictly in the real, admin-entered observation log --
// never inventing a promo, price, or claim not actually logged. This
// is distinct from the pre-existing competitor-research-agent.ts,
// which drafts a static profile from a one-time website fetch; this
// agent summarizes a real chronological activity history.
// Fabrication-guard applied since this is open-ended synthesis.
export async function runCompetitorCampaignNarrativeAgent(params: { competitorId: string; triggeredBy?: string | null }): Promise<CompetitorNarrativeResult> {
  const agentRole = 'competitor_campaign_narrative_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'competitor_analysis',
    operationName: 'agentic_campaign_narrative',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to summarize a real competitor\'s logged activity history (real dated observations) into a short pattern summary (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a competitive-intelligence planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const observations = getObservationsForCompetitor(params.competitorId);
    const transcript = observations.map((o) => `${o.observedAt.toISOString().slice(0, 10)} [${o.channel}/${o.campaignType}]: ${o.description}`).join('\n');
    const searchOutput = observations.length === 0
      ? 'No real observations logged for this competitor yet.'
      : `${observations.length} real observation(s) logged, most recent first:\n${transcript}`;
    logStep(runId, stepIndex++, 'search', agentRole, 'load real logged observations', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'load real logged observations', output: searchOutput, tokensUsed: 0 });

    let narrative: string | null = null;
    let fabricationWarning = false;
    if (observations.length > 0) {
      const actInput = `Real logged competitor activity:\n${searchOutput}\n\nWrite a 3-4 sentence summary of this competitor's observed activity pattern (channels used, type of moves, recency) and one suggested next check. Reference only the real observations above. Do not invent a promo, price, date, or claim not actually logged.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a competitive-intelligence summarizer. Never invent a promotion, price, date, or claim not present in the real observations given to you.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;

      fabricationWarning = containsSuspiciousStatistics(actResult.content);
      narrative = fabricationWarning
        ? `[AI GENERATION WARNING: this summary may reference a figure not present in the real logged observations. Verify before acting on it.]\n\n${actResult.content}`
        : actResult.content;
    } else {
      const noDataMsg = 'No real observations logged yet -- log at least one real, dated observation via the Manual tab first.';
      logStep(runId, stepIndex++, 'act', agentRole, 'no observations', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'no observations', output: noDataMsg, tokensUsed: 0 });
      narrative = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No observation created -- narrative is advisory only', 'Narrative is advisory only', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No observation created -- narrative is advisory only', output: 'Narrative is advisory only', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { observationCount: observations.length, narrative }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, observationCount: observations.length, narrative, fabricationWarning };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
