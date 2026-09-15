import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq, desc } from 'drizzle-orm';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export const COVERED_DEMO_KEYS = [
  'demand_generation', 'referral_marketing', 'social_media_marketing', 'marketing_automation',
  'customer_marketing', 'reputation_review_marketing', 'social_listening', 'community_marketing',
  'retargeting', 'personalization_marketing', 'customer_journey_orchestration', 'pricing_promotion_marketing',
] as const;
export type CoveredDemoKey = typeof COVERED_DEMO_KEYS[number];

export function recordActivity(params: { demoKey: CoveredDemoKey; channel: string; action: string; outcomeMetricName?: string; outcomeMetricValue?: number; notes?: string; loggedBy: string }): string {
  if (!COVERED_DEMO_KEYS.includes(params.demoKey)) throw new Error(`demoKey "${params.demoKey}" is not covered by the Marketing Activity Log.`);
  if (!params.channel.trim()) throw new Error('channel is required.');
  if (!params.action.trim()) throw new Error('action is required.');
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.marketingActivityLog).values({
    id, demoKey: params.demoKey, channel: params.channel, action: params.action,
    outcomeMetricName: params.outcomeMetricName ?? null, outcomeMetricValue: params.outcomeMetricValue ?? null,
    notes: params.notes ?? null, loggedBy: params.loggedBy, loggedAt: now, createdAt: now,
  }).run();
  recordEvidence({
    moduleKey: 'marketing_activity_log', claimClass: 'fact',
    claimText: `Real ${params.demoKey} activity logged on channel "${params.channel}": ${params.action}.`,
    sourceRef: `marketing_activity_log:${id}`, sourceTable: 'marketing_activity_log', confidence: 'high', createdBy: params.loggedBy,
  });
  return id;
}

export function getActivities(demoKey: CoveredDemoKey) {
  return db.select().from(schema.marketingActivityLog).where(eq(schema.marketingActivityLog.demoKey, demoKey)).orderBy(desc(schema.marketingActivityLog.loggedAt)).all();
}

export function getActivitySummary() {
  const rows = db.select().from(schema.marketingActivityLog).all();
  const byDemoKey: Record<string, number> = {};
  for (const r of rows) byDemoKey[r.demoKey] = (byDemoKey[r.demoKey] ?? 0) + 1;
  return { totalActivities: rows.length, byDemoKey, coveredDemoKeys: COVERED_DEMO_KEYS };
}
