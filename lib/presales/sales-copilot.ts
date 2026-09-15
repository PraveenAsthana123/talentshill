import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';
import { getLatestSnapshots } from '@/lib/kpi/kpi-engine';
import { getHeadToHead } from '@/lib/competitor/competitor-benchmark';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export interface TalkingPoint {
  text: string;
  sourceModule: string;
}

// Pure: real deterministic composition -- no live chat, no LLM call.
// Distinct from the Growth Brief (#14, a full document): this produces
// short, sales-call-ready bullet points.
export function formatTalkingPoints(kpiHighlights: { dimension: string; value: number; unit: string }[], competitorGaps: { dimension: string; gap: number }[] | null): TalkingPoint[] {
  const points: TalkingPoint[] = [];
  for (const k of kpiHighlights) {
    points.push({ text: `Real ${k.dimension.replace(/_/g, ' ')}: ${k.value}${k.unit === 'percent' ? '%' : ''} (measured, not projected).`, sourceModule: 'kpi_engine' });
  }
  if (competitorGaps) {
    const leading = competitorGaps.filter((g) => g.gap > 0).sort((a, b) => b.gap - a.gap)[0];
    if (leading) points.push({ text: `TalentsHill leads on ${leading.dimension.replace(/_/g, ' ')} by ${leading.gap} points (real, admin-scored head-to-head).`, sourceModule: 'competitor_benchmark_engine' });
    const trailing = competitorGaps.filter((g) => g.gap < 0).sort((a, b) => a.gap - b.gap)[0];
    if (trailing) points.push({ text: `Known gap on ${trailing.dimension.replace(/_/g, ' ')} (${trailing.gap} points) -- acknowledge proactively, don't oversell.`, sourceModule: 'competitor_benchmark_engine' });
  }
  return points;
}

export function getSalesTalkingPoints(competitorId?: string): TalkingPoint[] {
  const snapshots = getLatestSnapshots().filter((s) => s.value !== null);
  const kpiHighlights = snapshots.slice(0, 3).map((s) => ({ dimension: s.dimension, value: s.value as number, unit: s.unit }));

  let competitorGaps: { dimension: string; gap: number }[] | null = null;
  if (competitorId) {
    const competitor = db.select().from(schema.competitorAnalysis).where(eq(schema.competitorAnalysis.id, competitorId)).get();
    if (competitor) {
      competitorGaps = getHeadToHead(competitorId).filter((r) => r.gap !== null).map((r) => ({ dimension: r.dimension, gap: r.gap as number }));
    }
  }

  const points = formatTalkingPoints(kpiHighlights, competitorGaps);
  if (points.length > 0) {
    const firstSnapshotId = snapshots[0]?.id;
    recordEvidence({
      moduleKey: 'sales_copilot',
      claimClass: 'inference',
      claimText: `Sales Copilot generated ${points.length} real talking points${competitorId ? ` vs competitor ${competitorId}` : ''}.`,
      sourceRef: firstSnapshotId ? `kpi_snapshot:${firstSnapshotId}` : `sales_copilot_run:${randomUUID()}`,
      sourceTable: firstSnapshotId ? 'kpi_snapshot' : undefined,
      confidence: 'medium',
      createdBy: 'system',
    });
  }
  return points;
}
