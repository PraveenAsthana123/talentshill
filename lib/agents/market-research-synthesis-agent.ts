import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getMarketResearchBriefById } from '@/lib/db/market-research-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface MarketResearchSynthesisResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; briefId: string | null; synthesizedFindings: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real synthesis agent -- unlike the generic readiness-advisor pattern
// used elsewhere, this drafts an actual findings summary, but strictly
// grounded in the brief's own real sourceNotes (analyst-provided
// input). Never invents market statistics, competitor names, or
// figures not present in sourceNotes -- mirrors the RAG QA agent's
// "answer only from provided context" discipline. Advisory only: does
// NOT write the draft back to the brief's findings field; a human
// reviews and copies it in via the Manual tab if they approve it.
export async function runMarketResearchSynthesisAgent(params: { briefId: string; triggeredBy?: string | null }): Promise<MarketResearchSynthesisResult> {
  const agentRole = 'market_research_synthesizer';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'market_research', operationName: 'agentic_findings_synthesis', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const brief = getMarketResearchBriefById(params.briefId);
  if (!brief) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'brief not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, briefId: null, synthesizedFindings: null };
  }

  try {
    const planInput = `Research brief "${brief.title}" on topic "${brief.topic}". Plan how to synthesize findings from the provided source notes (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a market-research synthesis planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const hasNotes = !!brief.sourceNotes && brief.sourceNotes.trim().length > 0;
    const searchOutput = hasNotes ? `Real source notes found: ${brief.sourceNotes!.length} chars` : 'No source notes present -- cannot synthesize without real analyst-provided input';
    logStep(runId, stepIndex++, 'search', agentRole, params.briefId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.briefId, output: searchOutput, tokensUsed: 0 });

    let synthesizedFindings: string | null = null;
    if (hasNotes) {
      const actInput = `Topic: ${brief.topic}\n\nSource notes (the ONLY real information available):\n${brief.sourceNotes}\n\nSynthesize a concise, structured findings summary using ONLY the information in the source notes above. Do not invent statistics, competitor names, or facts not present in the notes. If the notes are too thin to support a real finding, say so explicitly.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a market-research synthesis assistant. Never invent facts, statistics, or names not present in the provided source notes.' },
        { role: 'user', content: actInput },
      ]);
      synthesizedFindings = actResult.content;
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;
    } else {
      const output = 'Skipped synthesis -- no real source notes to ground it in.';
      logStep(runId, stepIndex++, 'act', agentRole, '(skipped)', output, 0);
      steps.push({ phase: 'act', agentRole, input: '(skipped)', output, tokensUsed: 0 });
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No brief field changed -- findings draft is advisory only', 'Not written to the brief; a human reviews and copies it in if approved', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No brief field changed -- findings draft is advisory only', output: 'Not written to the brief; a human reviews and copies it in if approved', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { briefId: params.briefId, synthesizedFindings }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, briefId: params.briefId, synthesizedFindings };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
