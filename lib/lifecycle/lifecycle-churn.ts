import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq, desc } from 'drizzle-orm';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

// Demo 6 -- Lifecycle / Churn AI. Net-new, deterministic classification --
// no LLM call, no fabricated propensity model. The only real, timestamped
// engagement signal in this app is contact_submissions.createdAt (a
// single intake event, not a full behavioral event log) -- disclosed
// honestly rather than implying a richer engagement history exists. A
// contact with no real qualificationStage data gets stage='unknown'.

export type LifecycleStage = 'new' | 'engaged' | 'active_customer' | 'at_risk' | 'churned' | 'unknown';
export type ChurnRisk = 'low' | 'medium' | 'high' | 'unknown';

export function classifyLifecycle(qualificationStage: string | null, daysSinceLastActivity: number | null): { stage: LifecycleStage; churnRisk: ChurnRisk } {
  if (daysSinceLastActivity === null || !qualificationStage) return { stage: 'unknown', churnRisk: 'unknown' };

  if (qualificationStage === 'unqualified') return { stage: 'new', churnRisk: 'unknown' };
  if (qualificationStage === 'mql' || qualificationStage === 'sql' || qualificationStage === 'opportunity') {
    return { stage: 'engaged', churnRisk: 'unknown' };
  }
  // qualificationStage === 'customer'
  if (daysSinceLastActivity <= 30) return { stage: 'active_customer', churnRisk: 'low' };
  if (daysSinceLastActivity <= 90) return { stage: 'active_customer', churnRisk: 'medium' };
  if (daysSinceLastActivity <= 180) return { stage: 'at_risk', churnRisk: 'high' };
  return { stage: 'churned', churnRisk: 'high' };
}

export function recomputeLifecycleForAllContacts() {
  const submissions = db.select().from(schema.contactSubmissions).all();
  const now = new Date();
  let computed = 0;

  for (const s of submissions) {
    const daysSinceLastActivity = Math.floor((now.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const { stage, churnRisk } = classifyLifecycle(s.qualificationStage, daysSinceLastActivity);

    const existing = db.select().from(schema.customerLifecycle).where(eq(schema.customerLifecycle.contactEmail, s.email)).get();
    if (existing) {
      db.update(schema.customerLifecycle).set({ stage, churnRisk, daysSinceLastActivity, computedAt: now }).where(eq(schema.customerLifecycle.id, existing.id)).run();
    } else {
      db.insert(schema.customerLifecycle).values({ id: randomUUID(), contactEmail: s.email, stage, churnRisk, daysSinceLastActivity, computedAt: now }).run();
    }
    computed++;
  }

  recordEvidence({
    moduleKey: 'lifecycle', claimClass: 'inference',
    claimText: `Lifecycle/churn recomputed for ${computed} real contacts from contact_submissions.createdAt recency (the only real engagement timestamp available).`,
    sourceRef: `lifecycle_recompute:${now.toISOString()}`, sourceTable: 'customer_lifecycle', confidence: 'medium', createdBy: 'system',
  });

  return { computed };
}

export function getLifecycleSummary() {
  const rows = db.select().from(schema.customerLifecycle).all();
  const byStage: Record<string, number> = {};
  const atRiskOrChurned: typeof rows = [];
  for (const r of rows) {
    byStage[r.stage] = (byStage[r.stage] ?? 0) + 1;
    if (r.stage === 'at_risk' || r.stage === 'churned') atRiskOrChurned.push(r);
  }
  return {
    totalContacts: rows.length,
    byStage,
    atRiskOrChurned: atRiskOrChurned.sort((a, b) => (b.daysSinceLastActivity ?? 0) - (a.daysSinceLastActivity ?? 0)).slice(0, 10),
    gapsDisclosed: 'Recency is derived only from contact_submissions.createdAt (a single intake event) -- no real product-usage or purchase-event log exists yet to compute a richer engagement/activation score.',
  };
}

export function getLatestLifecycleRows(limit = 20) {
  return db.select().from(schema.customerLifecycle).orderBy(desc(schema.customerLifecycle.computedAt)).limit(limit).all();
}
