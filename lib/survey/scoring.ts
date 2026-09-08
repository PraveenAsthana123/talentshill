export interface SurveyScoreResult {
  totalScore: number;
  maturityLevel: 'beginner' | 'developing' | 'advanced' | 'leader';
  recommendedPath: string;
  segmentationTags: string[];
}

export function calculateSurveyScore(answers: {
  questionId: string;
  answerValue: string;
  scoreValue: number;
}[]): SurveyScoreResult {
  const totalRawScore = answers.reduce((sum, a) => sum + a.scoreValue, 0);
  const maxPossible = answers.length * 10; // max 10 per question
  const totalScore = Math.round((totalRawScore / Math.max(maxPossible, 1)) * 100);

  const maturityLevel = totalScore >= 80 ? 'leader'
    : totalScore >= 60 ? 'advanced'
    : totalScore >= 35 ? 'developing'
    : 'beginner';

  const recommendedPath = getRecommendedPath(maturityLevel);

  return { totalScore, maturityLevel, recommendedPath, segmentationTags: [] };
}

function getRecommendedPath(level: string): string {
  switch (level) {
    case 'leader':
      return 'Scale your AI operations across departments, build an AI Center of Excellence, and explore cutting-edge technologies like quantum computing.';
    case 'advanced':
      return 'Expand GenAI adoption enterprise-wide, invest in MLOps automation, and strengthen your AI governance frameworks.';
    case 'developing':
      return 'Strengthen your data foundation, start with 2-3 high-impact AI use cases, and build internal data literacy.';
    default:
      return 'Begin with an AI readiness assessment workshop, identify quick wins, and invest in team training on data and AI fundamentals.';
  }
}

export function generateSegmentationTags(data: {
  industry?: string | null;
  companySize?: string | null;
  totalScore: number;
  maturityLevel: string;
  answers: { questionId: string; answerValue: string }[];
}): string[] {
  const tags: string[] = [];

  // Maturity tag
  tags.push(`${data.maturityLevel.charAt(0).toUpperCase() + data.maturityLevel.slice(1)}-Maturity`);

  // Industry tag
  if (data.industry) {
    tags.push(data.industry.charAt(0).toUpperCase() + data.industry.slice(1));
  }

  // Company size tags
  const sizeMap: Record<string, string> = {
    '1-50': 'Startup',
    '51-200': 'SMB',
    '201-1000': 'Mid-Market',
    '1000+': 'Enterprise',
  };
  if (data.companySize && sizeMap[data.companySize]) {
    tags.push(sizeMap[data.companySize]);
  }

  // Score-based tags
  if (data.totalScore >= 70) tags.push('High-Readiness');
  if (data.totalScore < 30) tags.push('Needs-Foundation');

  // Answer-based interest tags
  for (const answer of data.answers) {
    const lower = answer.answerValue.toLowerCase();
    if (lower.includes('generative') || lower.includes('genai') || lower.includes('llm')) tags.push('GenAI-Interested');
    if (lower.includes('robot') || lower.includes('automation')) tags.push('Robotics-Interested');
    if (lower.includes('quantum')) tags.push('Quantum-Interested');
    if (lower.includes('iot') || lower.includes('sensor')) tags.push('IoT-Interested');
  }

  // Deduplicate
  return [...new Set(tags)];
}
