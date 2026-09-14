export interface LeadScoreResult {
  score: number;
  tier: 'hot' | 'warm' | 'cool' | 'cold';
}

export interface LeadScoreBreakdown extends LeadScoreResult {
  stages: { stage: string; input: string; points: number }[];
}

// Single source of truth for lead scoring. Previously this formula and
// lib/pipelines/lead-scoring-pipeline.ts's formula disagreed (different
// point weights AND a different cool-tier threshold, 25 vs 20) and both
// wrote to the same contact_submissions.leadScore/leadTier columns --
// re-running the Pipeline tab silently overwrote the submission-time
// score with a different number for the same lead. Fixed 2026-09-14:
// the pipeline now calls this function instead of duplicating the rubric.
const BUDGET_SCORES: Record<string, number> = {
  '250k+': 25, '100k-250k': 20, '50k-100k': 15, '25k-50k': 10, '10k-25k': 5,
};
const TIMELINE_SCORES: Record<string, number> = {
  'immediate': 20, '1-3months': 15, '3-6months': 10, '6months+': 5, 'exploring': 2,
};
const STAGE_SCORES: Record<string, number> = {
  'ready-to-start': 15, 'evaluating-vendors': 12, 'building-business-case': 8, 'research-phase': 4, 'just-exploring': 2,
};
const TARGET_INDUSTRIES = ['banking', 'healthcare', 'manufacturing', 'retail'];

function tierFromScore(score: number): 'hot' | 'warm' | 'cool' | 'cold' {
  return score >= 70 ? 'hot' : score >= 45 ? 'warm' : score >= 25 ? 'cool' : 'cold';
}

export function calculateLeadScore(data: {
  budgetRange?: string | null;
  timeline: string;
  company: string;
  message: string;
  interestAreas: string[];
  projectStage: string;
  industry: string;
}): LeadScoreBreakdown {
  const stages: LeadScoreBreakdown['stages'] = [];

  const budgetPoints = BUDGET_SCORES[data.budgetRange || ''] || 0;
  stages.push({ stage: 'budget', input: data.budgetRange || '(not provided)', points: budgetPoints });

  const timelinePoints = TIMELINE_SCORES[data.timeline] || 0;
  stages.push({ stage: 'timeline', input: data.timeline, points: timelinePoints });

  const stagePoints = STAGE_SCORES[data.projectStage] || 0;
  stages.push({ stage: 'project_stage', input: data.projectStage, points: stagePoints });

  const interestPoints = Math.min(data.interestAreas.length * 3, 15);
  stages.push({ stage: 'interest_breadth', input: `${data.interestAreas.length} areas`, points: interestPoints });

  const msgLen = data.message.length;
  let messagePoints = 0;
  if (msgLen > 500) messagePoints = 15;
  else if (msgLen > 300) messagePoints = 12;
  else if (msgLen > 150) messagePoints = 8;
  else if (msgLen > 80) messagePoints = 4;
  stages.push({ stage: 'message_quality', input: `${msgLen} chars`, points: messagePoints });

  const companyPoints = data.company && data.company.length > 2 ? 5 : 0;
  stages.push({ stage: 'company_provided', input: data.company || '(none)', points: companyPoints });

  const industryPoints = TARGET_INDUSTRIES.includes(data.industry) ? 5 : 0;
  stages.push({ stage: 'target_industry_bonus', input: data.industry, points: industryPoints });

  const score = Math.min(budgetPoints + timelinePoints + stagePoints + interestPoints + messagePoints + companyPoints + industryPoints, 100);
  const tier = tierFromScore(score);

  return { score, tier, stages };
}
