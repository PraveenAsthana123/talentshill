import { getLatestSnapshots } from '@/lib/kpi/kpi-engine';
import { getLatestGrowthReadiness } from '@/lib/kpi/growth-readiness';
import { getLatestOpportunities } from '@/lib/opportunity/opportunity-engine';
import { projectAllScenarios } from '@/lib/kpi/growth-scenario';
import { getEvidenceSummary } from '@/lib/evidence/evidence-ledger';

// Demo 7 -- Marketing Intelligence Control Tower. Pure, read-only
// composition of 4 independently-built real engines (KPI Engine,
// Growth Readiness Score, Opportunity Engine, Growth Scenario Simulator)
// plus the Evidence Ledger's real record count. No new data source, no
// LLM call -- this demo IS the "single platform exposing modules"
// recommendation from the source conversation's own "Best demos to
// build first" section, not a new capability.
export function getControlTowerView() {
  const kpis = getLatestSnapshots();
  const readiness = getLatestGrowthReadiness();
  const opportunities = getLatestOpportunities();
  const scenarios = projectAllScenarios(6);
  const evidence = getEvidenceSummary();

  return {
    kpis: kpis.map((k) => ({ dimension: k.dimension, value: k.value, unit: k.unit, confidence: k.confidence, sampleSize: k.sampleSize })),
    readinessScore: readiness?.score ?? null,
    readinessConfidence: readiness?.confidence ?? null,
    topOpportunities: opportunities.slice(0, 3).map((o) => ({ dimension: o.dimension, rationale: o.rationale, recommendedModuleKey: o.recommendedModuleKey })),
    sixMonthScenarios: scenarios,
    evidenceRecordCount: evidence.total,
    dataSourcesConnected: kpis.filter((k) => k.value !== null).length,
    dataSourcesTotal: kpis.length,
  };
}
