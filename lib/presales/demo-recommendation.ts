import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';
import { getLatestOpportunities } from '@/lib/opportunity/opportunity-engine';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export interface DemoRecommendation {
  moduleKey: string;
  moduleName: string;
  moduleDescription: string;
  reason: string;
}

// Pure composition: the real top-ranked opportunity (#3) already points
// at a real existing module (SOLUTION_MAP) -- this looks that module up
// in the real module_registry so a salesperson gets a real name/description
// to demo, not just a raw key.
export function getDemoRecommendation(): DemoRecommendation | null {
  const opportunities = getLatestOpportunities();
  const top = opportunities[0];
  if (!top) return null;

  const module = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.moduleKey, top.recommendedModuleKey)).get();
  if (!module) return null; // the recommended key doesn't resolve to a real module -- don't fabricate one

  const recommendation: DemoRecommendation = {
    moduleKey: module.moduleKey,
    moduleName: module.name,
    moduleDescription: module.description,
    reason: top.rationale,
  };

  recordEvidence({
    moduleKey: 'demo_recommendation_engine',
    claimClass: 'inference',
    claimText: `Demo Recommendation: show "${module.name}" -- ${top.rationale}`,
    sourceRef: `opportunity_candidate:${top.id}`,
    sourceTable: 'opportunity_candidate',
    confidence: 'medium',
    createdBy: 'system',
  });

  return recommendation;
}
