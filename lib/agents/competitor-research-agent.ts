import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';

export interface AgentStepRecord {
  phase: 'plan' | 'search' | 'act' | 'execute' | 'complete';
  agentRole: string;
  input: string;
  output: string;
  tokensUsed: number;
}

export interface AgentRunResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  competitorAnalysisId: string | null;
}

function logStep(runId: string, stepIndex: number, phase: AgentStepRecord['phase'], agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({
    id: randomUUID(),
    runId,
    stepIndex,
    phase,
    agentRole,
    input,
    output,
    tokensUsed,
    startedAt: now,
    completedAt: now,
    createdAt: now,
  }).run();
}

// Real single-agent plan -> search -> act -> execute -> complete loop.
// Honest about its own limits in the code, not just the UI: "search" here
// means a real HTTP fetch of the competitor's own site (no search-engine
// API is configured), and the agent's plan/analysis are real LLM output
// from a local Ollama model -- not scripted text, but also not guaranteed
// correct, which is exactly why the resulting entry stays in
// needs_research for a human to review, same as the Pipeline tab.
export async function runCompetitorResearchAgent(params: {
  serviceId: string;
  competitorName: string;
  competitorWebsite?: string;
  triggeredBy?: string | null;
}): Promise<AgentRunResult> {
  const agentRole = 'competitor_researcher';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'competitor_analysis',
    operationName: 'agentic_research_competitor',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const service = db.select().from(schema.services).where(eq(schema.services.id, params.serviceId)).get();
    if (!service) {
      updateOperationRunStatus(runId, 'failed', { errorMessage: 'serviceId does not reference a real service' });
      return { runId, agentCount: 1, steps, totalTokensUsed: 0, competitorAnalysisId: null };
    }

    // PLAN -- real LLM call
    const planInput = `Service: ${service.name} (${service.shortDesc || ''}). Competitor: ${params.competitorName}. Create a short, numbered research plan (max 4 steps) for what to check about this competitor for this service.`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a market-research planning agent. Be concise and concrete.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    // SEARCH -- real HTTP fetch (honest substitute for a web-search API,
    // which isn't configured). Same extraction as the Pipeline tab.
    let fetchedText = '';
    let searchOutput = 'No website provided -- search skipped.';
    if (params.competitorWebsite) {
      try {
        const res = await fetch(params.competitorWebsite, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TalentsHillResearchBot/1.0)' },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const html = await res.text();
          const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
          const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
          fetchedText = `Title: ${titleMatch ? titleMatch[1].trim() : '(none)'}\nDescription: ${descMatch ? descMatch[1].trim() : '(none)'}`;
          searchOutput = `Fetched ${params.competitorWebsite} -> HTTP ${res.status}. ${fetchedText}`;
        } else {
          searchOutput = `Fetch failed: HTTP ${res.status}`;
        }
      } catch (err) {
        searchOutput = `Fetch error: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
    logStep(runId, stepIndex++, 'search', agentRole, params.competitorWebsite || '(no website given)', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.competitorWebsite || '(none)', output: searchOutput, tokensUsed: 0 });

    // ACT -- real LLM call, drafting an analysis from the plan + fetched content
    const actInput = `Based on this plan:\n${planResult.content}\n\nAnd this real data fetched from the competitor's site:\n${fetchedText || '(no website data available)'}\n\nDraft a brief, honest offering-summary and strengths/weaknesses note for "${params.competitorName}" vs our "${service.name}" service. If there isn't enough real data, say so explicitly rather than guessing.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a market-research analysis agent. Never invent facts not supported by the given data -- say "insufficient data" where true.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    // EXECUTE -- real DB write. Status stays needs_research: an AI draft
    // is not the same as human-verified research.
    const id = randomUUID();
    const now = new Date();
    db.insert(schema.competitorAnalysis).values({
      id,
      serviceId: params.serviceId,
      competitorName: params.competitorName,
      competitorWebsite: params.competitorWebsite || null,
      offeringSummary: `[AI-drafted, needs human review] ${actResult.content}`.slice(0, 2000),
      pricingNotes: null,
      strengthsWeaknesses: null,
      sampleDeliverables: null,
      status: 'needs_research',
      isTemplate: false,
      lastResearchedAt: null,
      researchedBy: null,
      createdAt: now,
      updatedAt: now,
    }).run();
    logStep(runId, stepIndex++, 'execute', agentRole, `Insert competitor_analysis row`, `Created id=${id}`, 0);
    steps.push({ phase: 'execute', agentRole, input: 'Insert competitor_analysis row', output: `Created id=${id}`, tokensUsed: 0 });

    // COMPLETE
    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used across ${steps.length} steps`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { competitorAnalysisId: id }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, competitorAnalysisId: id };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, competitorAnalysisId: null };
  }
}
