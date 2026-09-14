import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runContentPerformancePipeline, type ContentPerformanceResult } from '@/lib/pipelines/content-performance-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ContentPerformanceAgentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  pipelineResult: ContentPerformanceResult;
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

export async function runContentPerformanceAgent(params: { triggeredBy?: string | null }): Promise<ContentPerformanceAgentResult> {
  const agentRole = 'content_performance_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'content',
    operationName: 'agentic_content_performance',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to turn a computed content-performance table into a short prioritized editorial narrative (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a content-performance planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const pipelineResult = await runContentPerformancePipeline({ triggeredBy: params.triggeredBy });
    const searchOutput = `${pipelineResult.scoredContent} scored content items, ${pipelineResult.unscoredContent} with no engagement data. Suggestions: ${JSON.stringify(pipelineResult.suggestions)}`;
    logStep(runId, stepIndex++, 'search', agentRole, 'run deterministic performance pipeline', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'run deterministic performance pipeline', output: searchOutput, tokensUsed: 0 });

    let narrative: string | null = null;
    if (pipelineResult.suggestions.length > 0) {
      const table = pipelineResult.suggestions
        .map((s) => `- "${s.title}" (${s.contentType}): action=${s.action}, conversion=${s.conversionRate === null ? 'no data' : (s.conversionRate * 100).toFixed(1) + '%'}, reason="${s.reason}"`)
        .join('\n');
      const actInput = `Here is a computed content-performance table. Write a 3-5 sentence editorial-strategy narrative for a content manager, referencing only these titles and numbers. Never invent a content item or number not listed below.\n\n${table}`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a content-performance advisor. Never invent facts, titles, or numbers not given to you in the input.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;
      narrative = actResult.content;
    } else {
      const noDataMsg = 'No content has real engagement entries yet -- nothing to optimize. Log views/leads via the Manual tab first.';
      logStep(runId, stepIndex++, 'act', agentRole, 'no scored content', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'no scored content', output: noDataMsg, tokensUsed: 0 });
      narrative = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No content field changed', 'Optimization suggestions are advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No content field changed', output: 'Optimization suggestions are advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', {
      outputPayload: { scoredContent: pipelineResult.scoredContent, suggestionCount: pipelineResult.suggestions.length, narrative },
      tokensUsed: totalTokens,
    });

    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, pipelineResult, narrative };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
