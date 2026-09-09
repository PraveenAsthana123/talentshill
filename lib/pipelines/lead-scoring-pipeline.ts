import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ScoringStageResult {
  stage: string;
  input: unknown;
  process: string;
  output: unknown;
  status: 'ok' | 'failed';
}

export interface LeadScoringResult {
  runId: string;
  stages: ScoringStageResult[];
  score: number;
  tier: 'hot' | 'warm' | 'cool' | 'cold';
  submissionId: string | null;
}

// Real, deterministic scoring rubric grounded in the actual field values
// the public contact form sends (features/forms/components/ContactForm.tsx)
// -- not invented enum values. Max 100 points:
//   projectStage  up to 25 (just-exploring=5 ... ready-to-start=25)
//   budgetRange   up to 25 (0 if not provided -- it's an optional field)
//   timeline      up to 25 (exploring=0 ... immediate=25)
//   message substance (>80 chars) 15
//   multiple interest areas (2+)  10
const PROJECT_STAGE_SCORES: Record<string, number> = {
  'just-exploring': 5, 'research-phase': 10, 'building-business-case': 15,
  'evaluating-vendors': 20, 'ready-to-start': 25,
};
const BUDGET_SCORES: Record<string, number> = {
  '10k-25k': 5, '25k-50k': 10, '50k-100k': 15, '100k-250k': 20, '250k+': 25,
};
const TIMELINE_SCORES: Record<string, number> = {
  'exploring': 0, '6months+': 5, '3-6months': 10, '1-3months': 20, 'immediate': 25,
};

function tierFromScore(score: number): 'hot' | 'warm' | 'cool' | 'cold' {
  if (score >= 70) return 'hot';
  if (score >= 45) return 'warm';
  if (score >= 20) return 'cool';
  return 'cold';
}

export function runLeadScoringPipeline(params: { submissionId: string; triggeredBy?: string | null }): LeadScoringResult {
  const stages: ScoringStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'leads',
    operationName: 'pipeline_score_lead',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const submission = db.select().from(schema.contactSubmissions).where(eq(schema.contactSubmissions.id, params.submissionId)).get();
  if (!submission) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'submission not found' });
    return { runId, stages, score: 0, tier: 'cold', submissionId: null };
  }

  const stageScore = PROJECT_STAGE_SCORES[submission.projectStage] ?? 0;
  stages.push({ stage: 'project_stage_score', input: submission.projectStage, process: 'Look up real score for this project stage value', output: stageScore, status: 'ok' });

  const budgetScore = submission.budgetRange ? (BUDGET_SCORES[submission.budgetRange] ?? 0) : 0;
  stages.push({ stage: 'budget_score', input: submission.budgetRange || '(not provided)', process: 'Look up real score for this budget range value', output: budgetScore, status: 'ok' });

  const timelineScore = TIMELINE_SCORES[submission.timeline] ?? 0;
  stages.push({ stage: 'timeline_score', input: submission.timeline, process: 'Look up real score for this timeline value', output: timelineScore, status: 'ok' });

  const messageScore = submission.message && submission.message.length > 80 ? 15 : 0;
  stages.push({ stage: 'message_substance_score', input: `${submission.message?.length || 0} chars`, process: 'Score 15 if message >80 chars (indicates real intent, not a spam/one-line submission)', output: messageScore, status: 'ok' });

  let interestCount = 0;
  try {
    interestCount = JSON.parse(submission.interestAreas || '[]').length;
  } catch { /* malformed JSON, treat as 0 */ }
  const interestScore = interestCount >= 2 ? 10 : 0;
  stages.push({ stage: 'interest_breadth_score', input: `${interestCount} areas`, process: 'Score 10 if 2+ interest areas selected', output: interestScore, status: 'ok' });

  const totalScore = stageScore + budgetScore + timelineScore + messageScore + interestScore;
  const tier = tierFromScore(totalScore);

  db.update(schema.contactSubmissions).set({ leadScore: totalScore, leadTier: tier }).where(eq(schema.contactSubmissions.id, params.submissionId)).run();
  stages.push({ stage: 'write_score', input: { totalScore, tier }, process: 'Update contact_submissions.leadScore/leadTier', output: { leadScore: totalScore, leadTier: tier }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore, tier } });
  return { runId, stages, score: totalScore, tier, submissionId: params.submissionId };
}
