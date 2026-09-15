import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { calculateLeadScore } from '@/lib/contact/lead-scoring';
import { classifyQualificationStage, resolveQualificationStageOnRescore, type QualificationStage } from '@/lib/contact/lead-qualification-stage';
import { sendHotLeadAlertIfNeeded } from '@/lib/contact/lead-alert';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

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

// Delegates to lib/contact/lead-scoring.ts's calculateLeadScore -- the
// single source of truth for the scoring rubric. This file previously
// duplicated the rubric with different weights and a different cool-tier
// threshold (25 vs 20), so running this pipeline silently overwrote the
// submission-time score with a different number for the same lead. Fixed
// 2026-09-14: one formula, called from both places.
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

  let interestAreas: string[] = [];
  try {
    interestAreas = JSON.parse(submission.interestAreas || '[]');
  } catch { /* malformed JSON, treat as no interest areas */ }

  const result = calculateLeadScore({
    budgetRange: submission.budgetRange,
    timeline: submission.timeline,
    company: submission.company || '',
    message: submission.message || '',
    interestAreas,
    projectStage: submission.projectStage,
    industry: submission.industry,
  });

  for (const s of result.stages) {
    stages.push({ stage: s.stage, input: s.input, process: 'Real weighted-rubric lookup, see lib/contact/lead-scoring.ts', output: s.points, status: 'ok' });
  }

  // Real evidence row: the score is a deterministic rubric computation
  // over this real submission's real fields, so it's a FACT (not an
  // ESTIMATE/INFERENCE) with high confidence -- traceable back to the
  // exact submission it was computed from.
  recordEvidence({
    moduleKey: 'leads',
    claimClass: 'fact',
    claimText: `Lead scored ${result.score} (${result.tier} tier) via the real weighted rubric.`,
    sourceRef: `contact_submissions:${submission.id}`,
    sourceTable: 'contact_submissions',
    confidence: 'high',
    createdBy: params.triggeredBy ?? 'system',
  });

  const autoClassified = classifyQualificationStage(result.tier);
  const qualificationStage = resolveQualificationStageOnRescore((submission.qualificationStage || 'unqualified') as QualificationStage, autoClassified);
  db.update(schema.contactSubmissions)
    .set({ leadScore: result.score, leadTier: result.tier, qualificationStage })
    .where(eq(schema.contactSubmissions.id, params.submissionId)).run();
  stages.push({ stage: 'write_score', input: { totalScore: result.score, tier: result.tier, qualificationStage }, process: 'Update contact_submissions.leadScore/leadTier/qualificationStage', output: { leadScore: result.score, leadTier: result.tier, qualificationStage }, status: 'ok' });

  // Fire-and-forget, same non-blocking pattern as app/api/contact/route.ts.
  // Uses submission.alertSentAt from BEFORE this update, so a lead that
  // just became hot via re-scoring still gets alerted exactly once.
  sendHotLeadAlertIfNeeded(
    { id: submission.id, fullName: submission.fullName, company: submission.company, email: submission.email, leadScore: result.score, leadTier: result.tier, alertSentAt: submission.alertSentAt, assignedTo: submission.assignedTo },
    qualificationStage,
  ).catch(() => {});

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: result.score, tier: result.tier, qualificationStage } });
  return { runId, stages, score: result.score, tier: result.tier, submissionId: params.submissionId };
}
