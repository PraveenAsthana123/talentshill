import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export type BenchmarkDimension = 'pricing_value' | 'service_breadth' | 'digital_presence' | 'thought_leadership' | 'client_trust_signals' | 'delivery_speed' | 'innovation_ai_adoption' | 'market_reach';

export const DIMENSIONS: BenchmarkDimension[] = ['pricing_value', 'service_breadth', 'digital_presence', 'thought_leadership', 'client_trust_signals', 'delivery_speed', 'innovation_ai_adoption', 'market_reach'];

export interface ScoreInput {
  subjectType: 'competitor' | 'self';
  competitorId?: string | null;
  dimension: BenchmarkDimension;
  score: number;
  notes?: string;
  scoredBy?: string;
}

export function recordScore(input: ScoreInput): string {
  if (input.score < 0 || input.score > 100) throw new Error('score must be 0-100');
  if (input.subjectType === 'competitor' && !input.competitorId) throw new Error('competitorId is required when subjectType=competitor');

  const existing = db.select().from(schema.competitorBenchmarkScore)
    .where(and(
      eq(schema.competitorBenchmarkScore.subjectType, input.subjectType),
      eq(schema.competitorBenchmarkScore.dimension, input.dimension),
      input.competitorId ? eq(schema.competitorBenchmarkScore.competitorId, input.competitorId) : eq(schema.competitorBenchmarkScore.subjectType, 'self'),
    )).get();

  const now = new Date();
  if (existing) {
    db.update(schema.competitorBenchmarkScore).set({ score: input.score, notes: input.notes ?? null, scoredBy: input.scoredBy ?? null, scoredAt: now }).where(eq(schema.competitorBenchmarkScore.id, existing.id)).run();
    return existing.id;
  }
  const id = randomUUID();
  db.insert(schema.competitorBenchmarkScore).values({
    id, subjectType: input.subjectType, competitorId: input.competitorId ?? null, dimension: input.dimension,
    score: input.score, notes: input.notes ?? null, scoredBy: input.scoredBy ?? null, scoredAt: now, createdAt: now,
  }).run();
  return id;
}

export interface HeadToHeadRow {
  dimension: BenchmarkDimension;
  selfScore: number | null;
  competitorScore: number | null;
  gap: number | null; // selfScore - competitorScore; positive = TalentsHill ahead
}

// Pure: real head-to-head gap per dimension. Returns null gap when either
// side has no real score yet -- never fabricates a 0.
export function computeHeadToHead(selfScores: Partial<Record<BenchmarkDimension, number>>, competitorScores: Partial<Record<BenchmarkDimension, number>>): HeadToHeadRow[] {
  return DIMENSIONS.map((dim) => {
    const s = selfScores[dim] ?? null;
    const c = competitorScores[dim] ?? null;
    return { dimension: dim, selfScore: s, competitorScore: c, gap: s !== null && c !== null ? s - c : null };
  });
}

export function getHeadToHead(competitorId: string): HeadToHeadRow[] {
  const selfRows = db.select().from(schema.competitorBenchmarkScore).where(eq(schema.competitorBenchmarkScore.subjectType, 'self')).all();
  const compRows = db.select().from(schema.competitorBenchmarkScore).where(and(eq(schema.competitorBenchmarkScore.subjectType, 'competitor'), eq(schema.competitorBenchmarkScore.competitorId, competitorId))).all();
  const selfMap: Partial<Record<BenchmarkDimension, number>> = {};
  for (const r of selfRows) selfMap[r.dimension as BenchmarkDimension] = r.score;
  const compMap: Partial<Record<BenchmarkDimension, number>> = {};
  for (const r of compRows) compMap[r.dimension as BenchmarkDimension] = r.score;

  const rows = computeHeadToHead(selfMap, compMap);
  const competitor = db.select().from(schema.competitorAnalysis).where(eq(schema.competitorAnalysis.id, competitorId)).get();
  for (const row of rows) {
    if (row.gap === null) continue;
    recordEvidence({
      moduleKey: 'competitor_benchmark_engine',
      claimClass: 'estimate', // admin-judgment scores, not measured data
      claimText: `${row.dimension} vs ${competitor?.competitorName ?? competitorId}: TalentsHill ${row.selfScore}, competitor ${row.competitorScore} (gap ${row.gap > 0 ? '+' : ''}${row.gap}).`,
      sourceRef: `competitor_benchmark_score:${competitorId}:${row.dimension}`,
      sourceTable: 'competitor_benchmark_score',
      confidence: 'medium',
      createdBy: 'system',
    });
  }
  return rows;
}
