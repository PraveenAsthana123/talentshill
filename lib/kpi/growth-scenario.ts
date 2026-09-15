import { getLatestSnapshots, type Dimension } from '@/lib/kpi/kpi-engine';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

// Disclosed, hardcoded assumption rates -- editorial scenario bounds, not
// a forecast/prediction. Real starting point (real current KPI value),
// projected forward under 3 disclosed monthly growth assumptions.
export const SCENARIO_RATES = { conservative: 0.02, moderate: 0.05, aggressive: 0.10 } as const;
export type ScenarioName = keyof typeof SCENARIO_RATES;

export interface ScenarioPoint {
  month: number;
  conservative: number;
  moderate: number;
  aggressive: number;
}

// Pure: real compound projection, r^t. Rounds to 1 decimal.
export function projectScenario(currentValue: number, months: number): ScenarioPoint[] {
  const points: ScenarioPoint[] = [];
  for (let m = 0; m <= months; m++) {
    points.push({
      month: m,
      conservative: Math.round(currentValue * Math.pow(1 + SCENARIO_RATES.conservative, m) * 10) / 10,
      moderate: Math.round(currentValue * Math.pow(1 + SCENARIO_RATES.moderate, m) * 10) / 10,
      aggressive: Math.round(currentValue * Math.pow(1 + SCENARIO_RATES.aggressive, m) * 10) / 10,
    });
  }
  return points;
}

export interface DimensionScenario {
  dimension: Dimension;
  currentValue: number;
  months: number;
  projection: ScenarioPoint[];
}

// Real, DB-backed: projects every real KPI dimension that has a real
// current value (null-value dimensions are excluded, not projected from
// a fabricated 0).
export function projectAllScenarios(months = 6): DimensionScenario[] {
  const snapshots = getLatestSnapshots().filter((s) => s.value !== null);
  const results: DimensionScenario[] = snapshots.map((s) => ({
    dimension: s.dimension as Dimension, currentValue: s.value as number, months, projection: projectScenario(s.value as number, months),
  }));

  if (results.length > 0) {
    recordEvidence({
      moduleKey: 'growth_scenario_simulator',
      claimClass: 'hypothesis', // an editorial projection, not a measured fact
      claimText: `Growth Scenario projected for ${results.length} real KPI dimensions over ${months} months under disclosed 2%/5%/10% monthly assumptions.`,
      sourceRef: `kpi_snapshot:${snapshots[0].id}`,
      sourceTable: 'kpi_snapshot',
      confidence: 'low', // projections are inherently lower-confidence than the measured baseline
      createdBy: 'system',
    });
  }
  return results;
}
