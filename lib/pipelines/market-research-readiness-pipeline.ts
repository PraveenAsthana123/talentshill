import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getMarketResearchBriefById } from '@/lib/db/market-research-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface MarketResearchReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; briefId: string | null }

// Real, deterministic readiness score. Distinct from the existing
// competitor_analysis module -- this covers general market/topic
// research briefs grounded in analyst-provided source notes, never
// fabricated statistics.
//   topic set                                    25
//   real source notes present (>50 chars)          25
//   findings present                               25
//   status progressed past draft                   25
export async function runMarketResearchReadinessPipeline(params: { briefId: string; triggeredBy?: string | null }): Promise<MarketResearchReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'market_research', operationName: 'pipeline_brief_readiness', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const brief = getMarketResearchBriefById(params.briefId);
  if (!brief) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'brief not found' });
    return { runId, stages, score: 0, briefId: null };
  }

  const topicScore = brief.topic && brief.topic.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'topic_check', input: brief.topic, process: 'Score 25 if a real topic is set', output: topicScore, status: 'ok' });

  const sourceScore = brief.sourceNotes && brief.sourceNotes.trim().length > 50 ? 25 : 0;
  stages.push({ stage: 'source_notes_check', input: brief.sourceNotes?.length ?? 0, process: 'Score 25 if real source notes are present and substantive (>50 chars) -- never fabricated market data', output: sourceScore, status: 'ok' });

  const findingsScore = brief.findings && brief.findings.trim().length > 0 ? 25 : 0;
  stages.push({ stage: 'findings_check', input: brief.findings?.length ?? 0, process: 'Score 25 if findings are present', output: findingsScore, status: 'ok' });

  const progressScore = brief.status !== 'draft' ? 25 : 0;
  stages.push({ stage: 'status_progress_check', input: brief.status, process: "Score 25 if status has progressed past 'draft'", output: progressScore, status: 'ok' });

  const totalScore = topicScore + sourceScore + findingsScore + progressScore;
  db.update(schema.marketResearchBriefs).set({ readinessScore: totalScore }).where(eq(schema.marketResearchBriefs.id, params.briefId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update market_research_briefs.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, briefId: params.briefId };
}
