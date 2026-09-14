import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getBrandAssetById } from '@/lib/db/brand-asset-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runBrandAssetReadinessPipeline } from '@/lib/pipelines/brand-asset-readiness-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface BrandAssetAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; assetId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

export async function runBrandAssetReadinessAgent(params: { assetId: string; triggeredBy?: string | null }): Promise<BrandAssetAgentResult> {
  const agentRole = 'brand_asset_readiness_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'branding', operationName: 'agentic_readiness_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const asset = getBrandAssetById(params.assetId);
  if (!asset) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'asset not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, assetId: null, recommendation: null };
  }

  try {
    const planInput = `Brand asset "${asset.name}" (category: ${asset.category}, status: ${asset.status}). Plan how to recommend a readiness fix if needed (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a brand-asset readiness planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const readiness = await runBrandAssetReadinessPipeline({ assetId: params.assetId, triggeredBy: params.triggeredBy });
    const failedChecks = readiness.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Readiness score: ${readiness.score}/100. Gaps: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.assetId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.assetId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Asset: name="${asset.name}", category=${asset.category}, readiness score=${readiness.score}/100, gaps=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the top fix. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a brand-asset readiness advisor. Never invent facts about the asset not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No asset field changed beyond the readiness score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No asset field changed beyond the readiness score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { assetId: params.assetId, score: readiness.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, assetId: params.assetId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
