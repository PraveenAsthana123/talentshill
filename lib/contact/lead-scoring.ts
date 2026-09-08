export interface LeadScoreResult {
  score: number;
  tier: 'hot' | 'warm' | 'cool' | 'cold';
}

export function calculateLeadScore(data: {
  budgetRange?: string | null;
  timeline: string;
  company: string;
  message: string;
  interestAreas: string[];
  projectStage: string;
  industry: string;
}): LeadScoreResult {
  let score = 0;

  // Budget (0-25 points)
  const budgetScores: Record<string, number> = {
    '250k+': 25, '100k-250k': 20, '50k-100k': 15, '25k-50k': 10, '10k-25k': 5,
  };
  score += budgetScores[data.budgetRange || ''] || 0;

  // Timeline (0-20 points)
  const timelineScores: Record<string, number> = {
    'immediate': 20, '1-3months': 15, '3-6months': 10, '6months+': 5, 'exploring': 2,
  };
  score += timelineScores[data.timeline] || 0;

  // Project Stage (0-15 points)
  const stageScores: Record<string, number> = {
    'ready-to-start': 15, 'evaluating-vendors': 12, 'building-business-case': 8, 'research-phase': 4, 'just-exploring': 2,
  };
  score += stageScores[data.projectStage] || 0;

  // Interest Areas (0-15 points) — more areas = higher intent
  score += Math.min(data.interestAreas.length * 3, 15);

  // Message quality (0-15 points) — longer, more detailed messages
  const msgLen = data.message.length;
  if (msgLen > 500) score += 15;
  else if (msgLen > 300) score += 12;
  else if (msgLen > 150) score += 8;
  else if (msgLen > 80) score += 4;

  // Company name provided (0-5 points)
  if (data.company && data.company.length > 2) score += 5;

  // Industry match bonus (0-5 points) — target industries
  const targetIndustries = ['banking', 'healthcare', 'manufacturing', 'retail'];
  if (targetIndustries.includes(data.industry)) score += 5;

  score = Math.min(score, 100);

  // Assign tier
  const tier = score >= 70 ? 'hot' : score >= 45 ? 'warm' : score >= 25 ? 'cool' : 'cold';

  return { score, tier };
}
