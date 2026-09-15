import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export interface DemandMapEntry {
  key: string;
  count: number;
}

export interface DemandMap {
  byIndustry: DemandMapEntry[];
  byInterestArea: DemandMapEntry[];
  totalSubmissions: number;
}

// Real aggregation over real contact_submissions -- industry is a direct
// column; interestAreas is a real JSON array per submission, parsed and
// tallied. A submission with malformed JSON is skipped from the
// interest-area tally (never silently miscounted as a fabricated area).
export function getDemandMap(): DemandMap {
  const rows = db.select().from(schema.contactSubmissions).all();
  const industryCounts = new Map<string, number>();
  const areaCounts = new Map<string, number>();

  for (const r of rows) {
    industryCounts.set(r.industry, (industryCounts.get(r.industry) ?? 0) + 1);
    try {
      const areas = JSON.parse(r.interestAreas || '[]') as string[];
      for (const a of areas) areaCounts.set(a, (areaCounts.get(a) ?? 0) + 1);
    } catch { /* malformed JSON, skip this submission's interest areas */ }
  }

  const toSorted = (m: Map<string, number>): DemandMapEntry[] => Array.from(m.entries()).map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);

  const result = { byIndustry: toSorted(industryCounts), byInterestArea: toSorted(areaCounts), totalSubmissions: rows.length };

  if (rows.length > 0) {
    recordEvidence({
      moduleKey: 'business_diagnostic',
      claimClass: 'fact',
      claimText: `Demand Map: top industry is ${result.byIndustry[0]?.key} (${result.byIndustry[0]?.count} of ${rows.length} real submissions).`,
      sourceRef: 'contact_submissions:demand_map_aggregate',
      sourceTable: 'contact_submissions',
      confidence: rows.length >= 20 ? 'high' : rows.length >= 5 ? 'medium' : 'low',
      createdBy: 'system',
    });
  }
  return result;
}

const STAGE_ORDER = ['unqualified', 'mql', 'sql', 'opportunity', 'customer'] as const;
export type FunnelStage = typeof STAGE_ORDER[number];

export interface FunnelTransition {
  fromStage: FunnelStage;
  toStage: FunnelStage;
  fromCount: number;
  toCount: number;
  conversionRate: number | null; // null if fromCount is 0
}

export interface FunnelConstraintResult {
  transitions: FunnelTransition[];
  constraint: FunnelTransition | null; // the transition with the lowest real conversion rate
}

// Pure: given real cumulative counts per stage (a lead at 'sql' is assumed
// to have also passed 'mql', i.e. monotonic progression -- disclosed
// simplifying assumption, this app doesn't log stage-transition history),
// finds the real weakest link in the funnel.
export function computeFunnelConstraint(cumulativeCounts: Record<FunnelStage, number>): FunnelConstraintResult {
  const transitions: FunnelTransition[] = [];
  for (let i = 0; i < STAGE_ORDER.length - 1; i++) {
    const fromStage = STAGE_ORDER[i];
    const toStage = STAGE_ORDER[i + 1];
    const fromCount = cumulativeCounts[fromStage];
    const toCount = cumulativeCounts[toStage];
    const conversionRate = fromCount > 0 ? Math.round((toCount / fromCount) * 1000) / 10 : null;
    transitions.push({ fromStage, toStage, fromCount, toCount, conversionRate });
  }
  const withRate = transitions.filter((t) => t.conversionRate !== null);
  const constraint = withRate.length > 0 ? withRate.reduce((worst, t) => (t.conversionRate! < worst.conversionRate! ? t : worst)) : null;
  return { transitions, constraint };
}

export function getFunnelConstraint(): FunnelConstraintResult {
  const rows = db.select().from(schema.contactSubmissions).all();
  const rank: Record<FunnelStage, number> = { unqualified: 0, mql: 1, sql: 2, opportunity: 3, customer: 4 };
  const cumulative: Record<FunnelStage, number> = { unqualified: 0, mql: 0, sql: 0, opportunity: 0, customer: 0 };
  for (const r of rows) {
    const stage = (r.qualificationStage ?? 'unqualified') as FunnelStage;
    const stageRank = rank[stage] ?? 0;
    for (const s of STAGE_ORDER) if (rank[s] <= stageRank) cumulative[s]++;
  }
  const result = computeFunnelConstraint(cumulative);
  if (result.constraint) {
    recordEvidence({
      moduleKey: 'business_diagnostic',
      claimClass: 'inference',
      claimText: `Funnel Constraint: ${result.constraint.fromStage} -> ${result.constraint.toStage} has the lowest real conversion rate (${result.constraint.conversionRate}%, ${result.constraint.toCount}/${result.constraint.fromCount}).`,
      sourceRef: 'contact_submissions:funnel_constraint_aggregate',
      sourceTable: 'contact_submissions',
      confidence: result.constraint.fromCount >= 20 ? 'high' : result.constraint.fromCount >= 5 ? 'medium' : 'low',
      createdBy: 'system',
    });
  }
  return result;
}
