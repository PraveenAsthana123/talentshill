import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getInfluencerCampaignById } from '@/lib/db/influencer-campaign-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface InfluencerSentimentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  campaignId: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | 'insufficient_data' | null;
  explanation: string | null;
}

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({
    id: randomUUID(), runId, stepIndex,
    phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete',
    agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now,
  }).run();
}

// Real NLP sentiment classification of real, admin-entered feedback
// text (campaignFeedbackNotes) -- not a fabricated social-listening API
// result. If no feedback text exists, the agent honestly reports
// insufficient data rather than inventing a sentiment score, same
// pattern already established for the competitor-analysis agent.
export async function runInfluencerSentimentAgent(params: { campaignId: string; triggeredBy?: string | null }): Promise<InfluencerSentimentResult> {
  const agentRole = 'influencer_sentiment_analyst';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'influencer_video',
    operationName: 'agentic_sentiment_analysis',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const campaign = getInfluencerCampaignById(params.campaignId);
  if (!campaign) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'campaign not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, campaignId: null, sentiment: null, explanation: null };
  }

  try {
    const planInput = `Campaign with ${campaign.influencerName}. Plan how to assess sentiment from real feedback notes, if any exist (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a sentiment-analysis planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const hasFeedback = campaign.campaignFeedbackNotes && campaign.campaignFeedbackNotes.trim().length > 0;
    const searchOutput = hasFeedback ? `Feedback notes present (${campaign.campaignFeedbackNotes!.length} chars)` : 'No feedback notes logged for this campaign';
    logStep(runId, stepIndex++, 'search', agentRole, params.campaignId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.campaignId, output: searchOutput, tokensUsed: 0 });

    if (!hasFeedback) {
      const insufficientMsg = 'Insufficient data: no feedback notes have been logged for this campaign. Add real client/audience feedback via the Manual tab before running sentiment analysis.';
      logStep(runId, stepIndex++, 'act', agentRole, 'no feedback text', insufficientMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'no feedback text', output: insufficientMsg, tokensUsed: 0 });
      logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
      steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });
      updateOperationRunStatus(runId, 'completed', { outputPayload: { campaignId: params.campaignId, sentiment: 'insufficient_data' }, tokensUsed: totalTokens });
      return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, campaignId: params.campaignId, sentiment: 'insufficient_data', explanation: insufficientMsg };
    }

    const actInput = `Real feedback notes for a campaign with influencer "${campaign.influencerName}":\n\n"${campaign.campaignFeedbackNotes}"\n\nClassify the sentiment as exactly one word -- positive, neutral, or negative -- on the first line, then a 1-2 sentence explanation quoting or referencing only the text above. Do not invent details not present in the text.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a sentiment-analysis agent. Classify only from the real text given. Never invent details not present in it.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    const firstLine = actResult.content.trim().split('\n')[0].toLowerCase();
    const sentiment: 'positive' | 'neutral' | 'negative' = firstLine.includes('positive') ? 'positive' : firstLine.includes('negative') ? 'negative' : 'neutral';

    logStep(runId, stepIndex++, 'execute', agentRole, 'No campaign field changed', 'Sentiment classification is advisory only, not written to a status field', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No campaign field changed', output: 'Sentiment classification is advisory only, not written to a status field', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { campaignId: params.campaignId, sentiment, explanation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, campaignId: params.campaignId, sentiment, explanation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
