import { randomUUID } from 'crypto';
import { and, gte, lt, isNotNull, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export type Confidence = 'unknown' | 'low' | 'medium' | 'high';
export type Dimension = 'lead_generation' | 'lead_quality' | 'email_engagement' | 'webinar_engagement' | 'ad_efficiency' | 'operational_health';

export interface KpiResult {
  value: number | null; // null, never a fabricated 0, when sampleSize is 0
  sampleSize: number;
  confidence: Confidence;
  unit: string;
}

// Pure, unit-tested -- 0 samples is UNKNOWN (not LOW), matching the same
// rubric already validated for SohamYoga's KPI Engine.
export function confidenceForSampleSize(n: number): Confidence {
  if (n <= 0) return 'unknown';
  if (n < 5) return 'low';
  if (n < 20) return 'medium';
  return 'high';
}

function periodRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

// ── Pure aggregate functions (unit-testable without a DB) ──

// Unlike a ratio (0/0 is undefined -> null), a real count of exactly 0 real
// submissions this period is itself a real fact, not a fabrication -- so
// this always returns a real value, never null.
export function computeLeadGeneration(submissionCount: number): KpiResult {
  return { value: submissionCount, sampleSize: submissionCount, confidence: confidenceForSampleSize(submissionCount), unit: 'count' };
}

export function computeLeadQuality(scores: number[]): KpiResult {
  const n = scores.length;
  if (n === 0) return { value: null, sampleSize: 0, confidence: 'unknown', unit: 'score_0_100' };
  const avg = Math.round((scores.reduce((s, x) => s + x, 0) / n) * 10) / 10;
  return { value: avg, sampleSize: n, confidence: confidenceForSampleSize(n), unit: 'score_0_100' };
}

export function computeRatio(numerator: number, denominator: number, unit = 'percent'): KpiResult {
  if (denominator === 0) return { value: null, sampleSize: 0, confidence: 'unknown', unit };
  const value = Math.round((numerator / denominator) * 1000) / 10;
  return { value, sampleSize: denominator, confidence: confidenceForSampleSize(denominator), unit };
}

export function computeAdEfficiency(clicks: number, conversions: number): KpiResult {
  return computeRatio(conversions, clicks, 'percent');
}

// ── Real DB-backed computation ──

export function getLeadGeneration(days: number): KpiResult {
  const { start, end } = periodRange(days);
  const rows = db.select().from(schema.contactSubmissions).where(and(gte(schema.contactSubmissions.createdAt, start), lt(schema.contactSubmissions.createdAt, end))).all();
  return computeLeadGeneration(rows.length);
}

export function getLeadQuality(days: number): KpiResult {
  const { start, end } = periodRange(days);
  const rows = db.select().from(schema.contactSubmissions).where(and(gte(schema.contactSubmissions.createdAt, start), lt(schema.contactSubmissions.createdAt, end), isNotNull(schema.contactSubmissions.leadScore))).all();
  return computeLeadQuality(rows.map((r) => r.leadScore as number));
}

export function getEmailEngagement(days: number): KpiResult {
  const { start, end } = periodRange(days);
  const rows = db.select().from(schema.campaignRecipients).where(and(isNotNull(schema.campaignRecipients.sentAt), gte(schema.campaignRecipients.sentAt, start), lt(schema.campaignRecipients.sentAt, end))).all();
  const opened = rows.filter((r) => r.openedAt !== null).length;
  return computeRatio(opened, rows.length, 'percent');
}

export function getWebinarEngagement(days: number): KpiResult {
  const { start, end } = periodRange(days);
  const rows = db.select().from(schema.webinarRegistrants).where(and(gte(schema.webinarRegistrants.registeredAt, start), lt(schema.webinarRegistrants.registeredAt, end), isNotNull(schema.webinarRegistrants.attended))).all();
  const attended = rows.filter((r) => r.attended === true).length;
  return computeRatio(attended, rows.length, 'percent');
}

export function getAdEfficiency(days: number): KpiResult {
  const { start, end } = periodRange(days);
  const rows = db.select().from(schema.adCampaignMetrics).where(and(gte(schema.adCampaignMetrics.recordedDate, start), lt(schema.adCampaignMetrics.recordedDate, end))).all();
  const clicks = rows.reduce((s, r) => s + (r.clicks ?? 0), 0);
  const conversions = rows.reduce((s, r) => s + (r.conversions ?? 0), 0);
  return computeAdEfficiency(clicks, conversions);
}

export function getOperationalHealth(days: number): KpiResult {
  const { start, end } = periodRange(days);
  const rows = db.select().from(schema.operationRun).where(and(gte(schema.operationRun.createdAt, start), lt(schema.operationRun.createdAt, end))).all();
  const finished = rows.filter((r) => r.status === 'completed' || r.status === 'failed');
  const completed = finished.filter((r) => r.status === 'completed').length;
  return computeRatio(completed, finished.length, 'percent');
}

const DIMENSION_FNS: Record<Dimension, (days: number) => KpiResult> = {
  lead_generation: getLeadGeneration,
  lead_quality: getLeadQuality,
  email_engagement: getEmailEngagement,
  webinar_engagement: getWebinarEngagement,
  ad_efficiency: getAdEfficiency,
  operational_health: getOperationalHealth,
};

// Computes all 6 real dimensions, persists a snapshot row per dimension,
// and records one FACT/UNKNOWN evidence row per dimension so the KPI
// numbers are traceable, not just displayed.
export function computeAndSnapshotAllKpis(days = 30): Record<Dimension, KpiResult> {
  const { start, end } = periodRange(days);
  const now = new Date();
  const results = {} as Record<Dimension, KpiResult>;
  for (const dim of Object.keys(DIMENSION_FNS) as Dimension[]) {
    const result = DIMENSION_FNS[dim](days);
    results[dim] = result;
    const id = randomUUID();
    db.insert(schema.kpiSnapshot).values({
      id, dimension: dim, periodStart: start, periodEnd: end,
      value: result.value, sampleSize: result.sampleSize, confidence: result.confidence,
      unit: result.unit, computedAt: now,
    }).run();
    recordEvidence({
      moduleKey: 'kpi_engine',
      claimClass: result.sampleSize > 0 ? 'fact' : 'unknown',
      claimText: result.value !== null
        ? `${dim}: ${result.value}${result.unit === 'percent' ? '%' : ''} over the trailing ${days} days (n=${result.sampleSize}).`
        : `${dim}: no real data in the trailing ${days} days.`,
      sourceRef: `kpi_snapshot:${id}`,
      sourceTable: 'kpi_snapshot',
      confidence: result.confidence === 'unknown' ? undefined : (result.confidence as 'low' | 'medium' | 'high'),
      createdBy: 'system',
    });
  }
  return results;
}

export function getLatestSnapshots() {
  const rows = db.select().from(schema.kpiSnapshot).all();
  const latestByDim = new Map<string, typeof rows[number]>();
  for (const r of rows) {
    const existing = latestByDim.get(r.dimension);
    if (!existing || r.computedAt > existing.computedAt) latestByDim.set(r.dimension, r);
  }
  return Array.from(latestByDim.values());
}
