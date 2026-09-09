import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getBannerById } from '@/lib/db/banner-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runBannerHealthPipeline } from '@/lib/pipelines/banner-health-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface BannerAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; bannerId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent banner-integrity advisory loop. "Search" reuses the
// real health pipeline. "Act" drafts a real, grounded fix recommendation
// -- never edits or deactivates the banner itself, purely advisory text
// for a human operator.
export async function runBannerHealthAgent(params: { bannerId: string; triggeredBy?: string | null }): Promise<BannerAgentResult> {
  const agentRole = 'banner_health_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'banners', operationName: 'agentic_health_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const banner = getBannerById(params.bannerId);
  if (!banner) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'banner not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, bannerId: null, recommendation: null };
  }

  try {
    const planInput = `Banner "${banner.title}" (placement: ${banner.placement}, active: ${banner.isActive}). Plan how to recommend an integrity fix if needed (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a site-operations banner-integrity planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const health = await runBannerHealthPipeline({ bannerId: params.bannerId, triggeredBy: params.triggeredBy });
    const failedChecks = health.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Health score: ${health.score}/100. Failed checks: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.bannerId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.bannerId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Banner: title="${banner.title}", active=${banner.isActive}, hasCtaText=${!!banner.ctaText}, hasCtaUrl=${!!banner.ctaUrl}, health score=${health.score}/100, failed checks=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the fix. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a banner-integrity advisor. Never invent facts about the banner not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No banner edit beyond the health score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No banner edit beyond the health score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { bannerId: params.bannerId, score: health.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, bannerId: params.bannerId, recommendation: actResult.content };
  } catch (err) {
    // Re-throw (after logging the failure to operation_run) rather than
    // returning a normal-looking result with bannerId: null -- otherwise
    // the API route's `result.bannerId ? 200 : 404` conflates "banner not
    // found" with "agent execution failed" (e.g. an Ollama timeout),
    // misreporting a real 502 as a misleading 404. Caught live 2026-09-09
    // when a real Ollama timeout came back as "banner not found".
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
