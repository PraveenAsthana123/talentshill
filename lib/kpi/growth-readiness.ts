import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getLatestSnapshots, confidenceForSampleSize, type Dimension, type Confidence } from '@/lib/kpi/kpi-engine';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

// Disclosed, hardcoded normalization targets -- count-type dimensions have
// no natural 0-100 ceiling, so a real target value maps to 100. Dimensions
// already on a 0-100/percent scale pass through unchanged (capped at 100).
const NORMALIZE_TARGET: Partial<Record<Dimension, number>> = {
  lead_generation: 50, // 50 real submissions/period treated as "fully healthy"
  ad_efficiency: 10, // 10% conversion rate treated as "fully healthy"
};

function normalize(dim: Dimension, value: number): number {
  const target = NORMALIZE_TARGET[dim];
  if (!target) return Math.min(100, value); // already 0-100 scale (percent, score_0_100)
  return Math.min(100, Math.round((value / target) * 1000) / 10);
}

function confidenceWeight(c: string): number {
  return c === 'high' ? 1 : c === 'medium' ? 0.6 : c === 'low' ? 0.3 : 0;
}

export interface DimensionInput {
  dimension: Dimension;
  value: number | null;
  confidence: string;
}

export interface GrowthReadinessResult {
  score: number | null; // null when zero real dimensions
  dimensionsIncluded: number;
  dimensionsExcluded: number;
  confidence: Confidence;
}

// Pure, unit-tested: confidence-weighted average of normalized dimension
// values. A dimension with null value (no real data) is excluded from the
// average entirely -- it does NOT drag the score toward 0.
export function computeGrowthReadinessScore(inputs: DimensionInput[]): GrowthReadinessResult {
  const included = inputs.filter((d) => d.value !== null);
  const excluded = inputs.length - included.length;
  if (included.length === 0) {
    return { score: null, dimensionsIncluded: 0, dimensionsExcluded: excluded, confidence: 'unknown' };
  }
  let weightedSum = 0;
  let weightTotal = 0;
  for (const d of included) {
    const w = confidenceWeight(d.confidence);
    weightedSum += normalize(d.dimension, d.value as number) * w;
    weightTotal += w;
  }
  const score = weightTotal > 0 ? Math.round((weightedSum / weightTotal) * 10) / 10 : null;
  return { score, dimensionsIncluded: included.length, dimensionsExcluded: excluded, confidence: confidenceForSampleSize(included.length) };
}

// Real, DB-backed: reads the real KPI Engine's latest snapshots, computes
// the composite, persists it, and records a real evidence row.
export function computeAndSnapshotGrowthReadiness(): GrowthReadinessResult {
  const snapshots = getLatestSnapshots();
  const inputs: DimensionInput[] = snapshots.map((s) => ({ dimension: s.dimension as Dimension, value: s.value, confidence: s.confidence }));
  const result = computeGrowthReadinessScore(inputs);
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.growthReadinessSnapshot).values({
    id, score: result.score, dimensionsIncluded: result.dimensionsIncluded,
    dimensionsExcluded: result.dimensionsExcluded, confidence: result.confidence, computedAt: now,
  }).run();
  recordEvidence({
    moduleKey: 'growth_readiness_score',
    claimClass: result.score !== null ? 'inference' : 'unknown',
    claimText: result.score !== null
      ? `Company-wide Growth Readiness Score: ${result.score}/100 (${result.dimensionsIncluded} of ${result.dimensionsIncluded + result.dimensionsExcluded} real KPI dimensions included).`
      : 'Company-wide Growth Readiness Score: no real KPI data available yet.',
    sourceRef: `growth_readiness_snapshot:${id}`,
    sourceTable: 'growth_readiness_snapshot',
    confidence: result.confidence === 'unknown' ? undefined : result.confidence,
    createdBy: 'system',
  });
  return result;
}

export function getLatestGrowthReadiness() {
  const rows = db.select().from(schema.growthReadinessSnapshot).all();
  return rows.sort((a, b) => b.computedAt.getTime() - a.computedAt.getTime())[0] ?? null;
}
