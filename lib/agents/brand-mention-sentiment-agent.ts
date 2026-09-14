import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getBrandMentionById, updateBrandMentionSentiment } from '@/lib/db/brand-mention-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface BrandMentionSentimentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  mentionId: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
}

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({
    id: randomUUID(), runId, stepIndex,
    phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete',
    agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now,
  }).run();
}

// Same real-NLP-on-real-text pattern as influencer-sentiment-agent.ts
// (use case 3): classifies sentiment and extracts topics from the real,
// admin-entered mention excerpt. Never fabricates a mention or invents
// details not in the given text.
export async function runBrandMentionSentimentAgent(params: { mentionId: string; triggeredBy?: string | null }): Promise<BrandMentionSentimentResult> {
  const agentRole = 'brand_mention_sentiment_analyst';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'branding',
    operationName: 'agentic_mention_sentiment',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const mention = getBrandMentionById(params.mentionId);
  if (!mention) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'mention not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, mentionId: null, sentiment: null };
  }

  try {
    const planInput = `Mention from ${mention.source}${mention.sourceName ? ` (${mention.sourceName})` : ''}. Plan how to classify sentiment and extract topics from the real excerpt (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a brand-sentiment planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const searchOutput = `Real excerpt present (${mention.excerpt.length} chars) from ${mention.source}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.mentionId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.mentionId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Real brand mention text (source: ${mention.source}):\n\n"${mention.excerpt}"\n\nRespond in exactly this format:\nSENTIMENT: <positive|neutral|negative>\nTOPICS: <comma-separated topics mentioned, 1-5 words each>\nEXPLANATION: <1-2 sentences, referencing only the text above>\n\nDo not invent details not present in the text.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a brand-sentiment analysis agent. Classify only from the real text given. Never invent details not present in it.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    const sentimentMatch = actResult.content.match(/SENTIMENT:\s*(positive|neutral|negative)/i);
    const topicsMatch = actResult.content.match(/TOPICS:\s*(.+)/i);
    const explanationMatch = actResult.content.match(/EXPLANATION:\s*([\s\S]+)/i);
    const sentiment: 'positive' | 'neutral' | 'negative' = (sentimentMatch?.[1]?.toLowerCase() as 'positive' | 'neutral' | 'negative') || 'neutral';
    const topics = topicsMatch?.[1] ? topicsMatch[1].split(',').map((t) => t.trim()).filter(Boolean).slice(0, 5) : [];
    const explanation = explanationMatch?.[1]?.trim() || actResult.content;

    updateBrandMentionSentiment(params.mentionId, { sentiment, sentimentExplanation: explanation, topics });

    logStep(runId, stepIndex++, 'execute', agentRole, `Updated brand_mentions ${params.mentionId}`, `sentiment=${sentiment}, topics=${topics.join('|')}`, 0);
    steps.push({ phase: 'execute', agentRole, input: `Updated brand_mentions ${params.mentionId}`, output: `sentiment=${sentiment}, topics=${topics.join('|')}`, tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { mentionId: params.mentionId, sentiment, topics }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, mentionId: params.mentionId, sentiment };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
