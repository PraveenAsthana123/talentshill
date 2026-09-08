import { randomUUID } from 'crypto';
import { eq, desc, and, count, sql } from 'drizzle-orm';
import { db, schema } from './index';

const { surveyResponses, surveyAnswers } = schema;

type MaturityLevel = 'beginner' | 'developing' | 'advanced' | 'leader';

// ── Types ──

interface SurveyAnswerInput {
  questionId: string;
  answerValue: string;
  scoreValue: number;
}

interface SaveSurveyResponseInput {
  contactName?: string;
  email?: string;
  company?: string;
  industry?: string;
  companySize?: string;
  role?: string;
  totalScore: number;
  maturityLevel: MaturityLevel;
  recommendedPath?: string;
  segmentationTags: string[];
  answers: SurveyAnswerInput[];
}

interface SurveyResponseWithAnswers {
  id: string;
  contactName: string | null;
  email: string | null;
  company: string | null;
  industry: string | null;
  companySize: string | null;
  role: string | null;
  totalScore: number;
  maturityLevel: string;
  recommendedPath: string | null;
  segmentationTags: string[];
  createdAt: Date;
  answers: { id: string; questionId: string; answerValue: string; scoreValue: number | null }[];
}

interface SurveyResponseRow {
  id: string;
  contactName: string | null;
  email: string | null;
  company: string | null;
  industry: string | null;
  companySize: string | null;
  role: string | null;
  totalScore: number;
  maturityLevel: string;
  recommendedPath: string | null;
  segmentationTags: string[];
  createdAt: Date;
}

// ── Helpers ──

function parseSegmentationTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function enrichResponse(row: typeof surveyResponses.$inferSelect): SurveyResponseRow {
  return {
    ...row,
    segmentationTags: parseSegmentationTags(row.segmentationTags),
  };
}

// ── Save Survey Response ──

export function saveSurveyResponse(data: SaveSurveyResponseInput): typeof surveyResponses.$inferSelect {
  const id = randomUUID();
  const now = new Date();

  const response = db.insert(surveyResponses).values({
    id,
    contactName: data.contactName || null,
    email: data.email || null,
    company: data.company || null,
    industry: data.industry || null,
    companySize: data.companySize || null,
    role: data.role || null,
    totalScore: data.totalScore,
    maturityLevel: data.maturityLevel,
    recommendedPath: data.recommendedPath || null,
    segmentationTags: JSON.stringify(data.segmentationTags),
    createdAt: now,
  }).returning().get();

  // Insert all answers
  for (const answer of data.answers) {
    db.insert(surveyAnswers).values({
      id: randomUUID(),
      responseId: id,
      questionId: answer.questionId,
      answerValue: answer.answerValue,
      scoreValue: answer.scoreValue,
    }).run();
  }

  return response;
}

// ── Get Response By ID ──

export function getResponseById(id: string): SurveyResponseWithAnswers | null {
  const row = db.select().from(surveyResponses).where(eq(surveyResponses.id, id)).get();
  if (!row) return null;

  const answers = db.select().from(surveyAnswers)
    .where(eq(surveyAnswers.responseId, id))
    .all();

  return {
    ...enrichResponse(row),
    answers: answers.map((a) => ({
      id: a.id,
      questionId: a.questionId,
      answerValue: a.answerValue,
      scoreValue: a.scoreValue,
    })),
  };
}

// ── Get All Responses (Paginated) ──

export function getAllResponses(options: {
  offset?: number;
  limit?: number;
  maturityLevel?: MaturityLevel;
  industry?: string;
} = {}): { responses: SurveyResponseRow[]; total: number } {
  const { offset = 0, limit = 50, maturityLevel, industry } = options;

  const conditions = [];
  if (maturityLevel) {
    conditions.push(eq(surveyResponses.maturityLevel, maturityLevel));
  }
  if (industry) {
    conditions.push(eq(surveyResponses.industry, industry));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = db.select({ cnt: count() }).from(surveyResponses).where(where).get();
  const total = totalResult?.cnt || 0;

  const rows = db.select().from(surveyResponses)
    .where(where)
    .orderBy(desc(surveyResponses.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

  const responses = rows.map(enrichResponse);
  return { responses, total };
}

// ── Survey Stats ──

export function getSurveyStats(): {
  total: number;
  avgScore: number;
  levelDistribution: { level: string; count: number }[];
  industryDistribution: { industry: string; count: number }[];
  topTags: { tag: string; count: number }[];
  recentCount30d: number;
} {
  const total = db.select({ cnt: count() }).from(surveyResponses).get()?.cnt || 0;

  // Average score
  const avgResult = db
    .select({ avg: sql<number>`avg(${surveyResponses.totalScore})` })
    .from(surveyResponses)
    .get();
  const avgScore = Math.round((avgResult?.avg || 0) * 100) / 100;

  // Level distribution
  const levelRows = db
    .select({ level: surveyResponses.maturityLevel, cnt: count() })
    .from(surveyResponses)
    .groupBy(surveyResponses.maturityLevel)
    .all();
  const levelDistribution = levelRows.map((r) => ({ level: r.level, count: r.cnt }));

  // Industry distribution (non-null only)
  const industryRows = db
    .select({ industry: surveyResponses.industry, cnt: count() })
    .from(surveyResponses)
    .where(sql`${surveyResponses.industry} IS NOT NULL`)
    .groupBy(surveyResponses.industry)
    .orderBy(desc(count()))
    .all();
  const industryDistribution = industryRows.map((r) => ({
    industry: r.industry as string,
    count: r.cnt,
  }));

  // Top tags — parse segmentationTags JSON from all rows and count each tag
  const allRows = db
    .select({ tags: surveyResponses.segmentationTags })
    .from(surveyResponses)
    .all();

  const tagCounts: Record<string, number> = {};
  for (const row of allRows) {
    const tags = parseSegmentationTags(row.tags);
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  const topTags = Object.entries(tagCounts)
    .map(([tag, cnt]) => ({ tag, count: cnt }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Recent count (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentResult = db
    .select({ cnt: count() })
    .from(surveyResponses)
    .where(sql`${surveyResponses.createdAt} > ${thirtyDaysAgo}`)
    .get();
  const recentCount30d = recentResult?.cnt || 0;

  return { total, avgScore, levelDistribution, industryDistribution, topTags, recentCount30d };
}

// ── Export All Responses ──

export function getAllResponsesForExport(): SurveyResponseRow[] {
  const rows = db.select().from(surveyResponses)
    .orderBy(desc(surveyResponses.createdAt))
    .all();

  return rows.map(enrichResponse);
}
