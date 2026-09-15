import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export type NextBestAction = 'schedule_call' | 'send_pricing' | 'request_budget_info' | 'nurture_email' | 'no_action_cold';

export interface NbaResult {
  action: NextBestAction;
  reason: string;
}

// Pure, deterministic rule lookup -- never LLM-estimated (that's what
// lead-qualification-agent.ts's free-text narrative is for; this is the
// structured, stored counterpart the gap analysis found missing).
export function computeNextBestAction(tier: 'hot' | 'warm' | 'cool' | 'cold', budgetRange: string | null | undefined): NbaResult {
  if (tier === 'hot') {
    return { action: 'schedule_call', reason: 'Hot lead (score >= 70) -- schedule a call within 24h.' };
  }
  if (tier === 'warm') {
    return budgetRange
      ? { action: 'send_pricing', reason: `Warm lead with budget known (${budgetRange}) -- send tailored pricing.` }
      : { action: 'request_budget_info', reason: 'Warm lead but budget not provided -- qualify budget before a proposal.' };
  }
  if (tier === 'cool') {
    return { action: 'nurture_email', reason: 'Cool lead -- enroll in a nurture sequence, revisit in 30 days.' };
  }
  return { action: 'no_action_cold', reason: 'Cold lead -- no immediate action, deprioritize.' };
}

// Real, DB-backed: persists the NBA and records it as a real, traceable
// evidence row (an INFERENCE -- the rule maps a real score to a
// recommendation, it doesn't measure an outcome).
export function recordNextBestAction(submissionId: string, tier: 'hot' | 'warm' | 'cool' | 'cold', score: number, budgetRange: string | null | undefined): string {
  const { action, reason } = computeNextBestAction(tier, budgetRange);
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.leadNextBestAction).values({ id, submissionId, action, reason, tier, score, computedAt: now }).run();
  recordEvidence({
    moduleKey: 'leads',
    claimClass: 'inference',
    claimText: `Next-best-action for this lead: ${action} -- ${reason}`,
    sourceRef: `lead_next_best_action:${id}`,
    sourceTable: 'lead_next_best_action',
    confidence: 'medium',
    createdBy: 'system',
  });
  return id;
}
