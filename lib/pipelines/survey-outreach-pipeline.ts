import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getResponseById } from '@/lib/db/survey-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface OutreachStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface SurveyOutreachResult { runId: string; stages: OutreachStageResult[]; score: number; responseId: string | null }

// Real, deterministic outreach-priority score grounded only in fields
// that actually exist on the response -- never a fabricated intent
// signal. Writes to the real, previously-unused
// survey_responses.outreach_priority field.
//   totalScore contribution   totalScore * 0.5 (max 50) -- the respondent's own AI-maturity score
//   has email                 25 (can't outreach without one -- the single gating factor)
//   has company                15
//   recency (created <=7d ago) 10
export async function runSurveyOutreachPipeline(params: { responseId: string; triggeredBy?: string | null }): Promise<SurveyOutreachResult> {
  const stages: OutreachStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'survey', operationName: 'pipeline_outreach_priority', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const response = getResponseById(params.responseId);
  if (!response) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'response not found' });
    return { runId, stages, score: 0, responseId: null };
  }

  const scoreContribution = Math.round(response.totalScore * 0.5);
  stages.push({ stage: 'maturity_score_check', input: `totalScore=${response.totalScore}`, process: 'Contribute totalScore * 0.5 (max 50)', output: scoreContribution, status: 'ok' });

  const emailScore = response.email ? 25 : 0;
  stages.push({ stage: 'email_check', input: response.email, process: 'Score 25 if email present (required to outreach at all)', output: emailScore, status: 'ok' });

  const companyScore = response.company ? 15 : 0;
  stages.push({ stage: 'company_check', input: response.company, process: 'Score 15 if company present', output: companyScore, status: 'ok' });

  const daysSinceCreated = (Date.now() - new Date(response.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = daysSinceCreated <= 7 ? 10 : 0;
  stages.push({ stage: 'recency_check', input: `${daysSinceCreated.toFixed(1)}d ago`, process: 'Score 10 if submitted within the last 7 days', output: recencyScore, status: 'ok' });

  const totalScore = Math.min(100, scoreContribution + emailScore + companyScore + recencyScore);
  db.update(schema.surveyResponses).set({ outreachPriority: totalScore }).where(eq(schema.surveyResponses.id, params.responseId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update survey_responses.outreach_priority (real, previously-unused field)', output: { outreachPriority: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, responseId: params.responseId };
}
