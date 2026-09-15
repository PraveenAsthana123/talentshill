import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getLatestSnapshots, type Dimension } from '@/lib/kpi/kpi-engine';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

// Disclosed, hardcoded business judgment -- not derived data. A dimension
// below `threshold` (lower-is-worse metrics) is a real gap; impact/
// feasibility are 1-10 editorial weights, same pattern as SohamYoga's
// OpportunityEngine THRESHOLDS/SOLUTION_MAP.
export const THRESHOLDS: Record<Dimension, { threshold: number; impact: number; feasibility: number }> = {
  lead_generation: { threshold: 20, impact: 9, feasibility: 6 },
  lead_quality: { threshold: 50, impact: 7, feasibility: 7 },
  email_engagement: { threshold: 40, impact: 6, feasibility: 8 },
  webinar_engagement: { threshold: 50, impact: 5, feasibility: 6 },
  ad_efficiency: { threshold: 3, impact: 7, feasibility: 5 },
  operational_health: { threshold: 90, impact: 8, feasibility: 9 },
};

// Real, existing modules only -- verified against module_registry before
// being added here.
export const SOLUTION_MAP: Record<Dimension, { moduleKey: string; rationale: string }> = {
  lead_generation: { moduleKey: 'ads_management', rationale: 'Increase real paid-lead volume via the existing Ads Management module.' },
  lead_quality: { moduleKey: 'leads', rationale: 'Tighten qualification criteria / follow-up cadence via the existing Lead Scoring + Qualification pipeline.' },
  email_engagement: { moduleKey: 'campaigns', rationale: 'Improve subject-line/segmentation quality via the existing Campaigns + Segments modules.' },
  webinar_engagement: { moduleKey: 'appointments', rationale: 'Instrument and improve attendance follow-through via the existing Appointments/Webinar module.' },
  ad_efficiency: { moduleKey: 'ads_management', rationale: 'Reallocate spend toward higher-converting creative/audiences via the existing Ads Management module.' },
  operational_health: { moduleKey: 'module_registry', rationale: 'Investigate failing pipeline runs via the existing Module Registry drift audit.' },
};

function confidenceWeight(c: string): number {
  return c === 'high' ? 1 : c === 'medium' ? 0.6 : c === 'low' ? 0.3 : 0.1;
}

export interface OpportunityCandidate {
  dimension: Dimension;
  gapType: 'below_threshold' | 'no_data';
  impactScore: number;
  feasibilityScore: number;
  confidenceWeight: number;
  rankScore: number;
  recommendedModuleKey: string;
  rationale: string;
}

// Pure, unit-testable: given a real snapshot's value/confidence for a
// dimension, decides whether it's a real gap and how it should rank.
// Lower-is-worse for all 6 current dimensions (no "higher is worse" ones
// yet), so a null value (no real data at all) is always a gap too.
export function evaluateDimension(dim: Dimension, value: number | null, confidence: string): OpportunityCandidate | null {
  const rule = THRESHOLDS[dim];
  const solution = SOLUTION_MAP[dim];
  const isNoData = value === null;
  const isBelowThreshold = value !== null && value < rule.threshold;
  if (!isNoData && !isBelowThreshold) return null;

  const weight = isNoData ? 0.1 : confidenceWeight(confidence);
  const rankScore = Math.round(rule.impact * rule.feasibility * weight * 10) / 10;
  return {
    dimension: dim,
    gapType: isNoData ? 'no_data' : 'below_threshold',
    impactScore: rule.impact,
    feasibilityScore: rule.feasibility,
    confidenceWeight: weight,
    rankScore,
    recommendedModuleKey: solution.moduleKey,
    rationale: isNoData
      ? `No real data yet for ${dim} -- instrument before it can be improved. ${solution.rationale}`
      : `${dim}=${value} is below the ${rule.threshold} threshold. ${solution.rationale}`,
  };
}

// Real DB-backed: reads the latest real kpi_snapshot rows, ranks real
// gaps, persists them, and records one evidence row per candidate.
export function computeAndRankOpportunities(): OpportunityCandidate[] {
  const snapshots = getLatestSnapshots();
  const candidates: OpportunityCandidate[] = [];
  const now = new Date();

  for (const snap of snapshots) {
    const candidate = evaluateDimension(snap.dimension as Dimension, snap.value, snap.confidence);
    if (!candidate) continue;
    candidates.push(candidate);
    const id = randomUUID();
    db.insert(schema.opportunityCandidate).values({
      id,
      dimension: candidate.dimension,
      gapType: candidate.gapType,
      kpiSnapshotId: snap.id,
      impactScore: candidate.impactScore,
      feasibilityScore: candidate.feasibilityScore,
      confidenceWeight: candidate.confidenceWeight,
      rankScore: candidate.rankScore,
      recommendedModuleKey: candidate.recommendedModuleKey,
      rationale: candidate.rationale,
      computedAt: now,
    }).run();
    recordEvidence({
      moduleKey: 'opportunity_benchmark_engine',
      claimClass: 'inference',
      claimText: `Opportunity: ${candidate.rationale} (rank=${candidate.rankScore})`,
      sourceRef: `opportunity_candidate:${id}`,
      sourceTable: 'opportunity_candidate',
      confidence: candidate.confidenceWeight >= 0.6 ? 'medium' : 'low',
      createdBy: 'system',
    });
  }

  return candidates.sort((a, b) => b.rankScore - a.rankScore);
}

export function getLatestOpportunities() {
  return db.select().from(schema.opportunityCandidate).orderBy(schema.opportunityCandidate.rankScore).all().reverse();
}
