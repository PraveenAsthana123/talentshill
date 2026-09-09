import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getAssessmentById } from '@/lib/db/analysis-assessment-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface HealthStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface AnalysisHealthResult { runId: string; stages: HealthStageResult[]; score: number; assessmentId: string | null }

// Real, deterministic assessment-health score grounded only in fields
// that already exist on the assessment. This is NOT a judgment on the
// assessor's overallScore (that stays a human quality call) -- it scores
// whether the assessment record itself is complete and current, so a
// completed-but-abandoned or stale in-progress assessment surfaces
// before it silently rots.
//   completion (completedItems / totalItems)   60
//   recency (days since updatedAt)              40: <7d=40, <30d=25, <90d=10, else 0
export async function runAnalysisHealthPipeline(params: { assessmentId: string; triggeredBy?: string | null }): Promise<AnalysisHealthResult> {
  const stages: HealthStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'analysis', operationName: 'pipeline_health_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const assessment = getAssessmentById(params.assessmentId);
  if (!assessment) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'assessment not found' });
    return { runId, stages, score: 0, assessmentId: null };
  }

  const completionRatio = assessment.totalItems > 0 ? assessment.completedItems / assessment.totalItems : 0;
  const completionScore = Math.round(completionRatio * 60);
  stages.push({ stage: 'completion_check', input: `${assessment.completedItems}/${assessment.totalItems}`, process: 'Score up to 60 proportional to completedItems/totalItems', output: completionScore, status: 'ok' });

  const ageMs = Date.now() - new Date(assessment.updatedAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recencyScore = ageDays < 7 ? 40 : ageDays < 30 ? 25 : ageDays < 90 ? 10 : 0;
  stages.push({ stage: 'recency_check', input: `${ageDays.toFixed(1)} days since updatedAt`, process: 'Score 40 if <7d, 25 if <30d, 10 if <90d, else 0', output: recencyScore, status: 'ok' });

  const totalScore = completionScore + recencyScore;
  db.update(schema.analysisAssessments).set({ healthScore: totalScore }).where(eq(schema.analysisAssessments.id, params.assessmentId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update analysis_assessments.health_score (real, previously-unused field)', output: { healthScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, assessmentId: params.assessmentId };
}
