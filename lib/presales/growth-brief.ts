import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getLatestSnapshots } from '@/lib/kpi/kpi-engine';
import { getLatestGrowthReadiness } from '@/lib/kpi/growth-readiness';
import { getLatestOpportunities } from '@/lib/opportunity/opportunity-engine';
import { getEvidenceSummary } from '@/lib/evidence/evidence-ledger';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

interface KpiLine { dimension: string; value: number | null; unit: string; confidence: string; }

// Pure: real text composition from already-computed real inputs -- no new
// data source, no LLM call. Deterministic given the same inputs.
export function formatGrowthBrief(kpis: KpiLine[], readinessScore: number | null, topOpportunity: { dimension: string; rationale: string } | null, evidenceCount: number): string {
  const lines: string[] = [];
  lines.push('TalentsHill Growth Brief');
  lines.push('');
  lines.push(`Growth Readiness Score: ${readinessScore === null ? 'insufficient real data yet' : `${readinessScore}/100`}`);
  lines.push('');
  lines.push('KPI Snapshot:');
  for (const k of kpis) {
    lines.push(`  - ${k.dimension}: ${k.value === null ? 'no real data yet' : `${k.value}${k.unit === 'percent' ? '%' : ''}`} (confidence: ${k.confidence})`);
  }
  lines.push('');
  lines.push(topOpportunity ? `Top Opportunity: ${topOpportunity.dimension} -- ${topOpportunity.rationale}` : 'Top Opportunity: none identified from current real data.');
  lines.push('');
  lines.push(`This brief is backed by ${evidenceCount} real, traceable evidence records.`);
  return lines.join('\n');
}

export function generateGrowthBrief(): { id: string; briefText: string } {
  const snapshots = getLatestSnapshots();
  const kpis: KpiLine[] = snapshots.map((s) => ({ dimension: s.dimension, value: s.value, unit: s.unit, confidence: s.confidence }));
  const readiness = getLatestGrowthReadiness();
  const opportunities = getLatestOpportunities();
  const top = opportunities[0] ?? null;
  const evidenceCount = getEvidenceSummary().total;

  const briefText = formatGrowthBrief(kpis, readiness?.score ?? null, top ? { dimension: top.dimension, rationale: top.rationale } : null, evidenceCount);

  const id = randomUUID();
  const now = new Date();
  db.insert(schema.growthBrief).values({
    id, briefText, topOpportunityDimension: top?.dimension ?? null,
    growthReadinessScore: readiness?.score ?? null, evidenceCount, generatedAt: now,
  }).run();

  recordEvidence({
    moduleKey: 'presales_growth_brief',
    claimClass: 'inference',
    claimText: `Growth Brief generated (readiness=${readiness?.score ?? 'n/a'}, top opportunity=${top?.dimension ?? 'none'}).`,
    sourceRef: `growth_brief:${id}`,
    sourceTable: 'growth_brief',
    confidence: 'medium',
    createdBy: 'system',
  });

  return { id, briefText };
}
