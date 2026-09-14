import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getActivationAggregateForAllContacts, type ContactActivationAggregate } from '@/lib/db/contact-activation-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export type LifecycleStage = 'new' | 'engaged' | 'at_risk' | 'churned';

// Pure classification, unit-tested in isolation, `now` passed in (never
// Date.now() inside pure logic) so results are deterministic and
// reproducible in tests. Distinct from leads' MQL/SQL funnel (a
// different table, contact_submissions, judged by form-submission
// quality) and distinct from contacts.leadScore (a static profile-
// completeness rubric, contact-completeness-pipeline.ts) -- this is
// purely behavioral: real send/open/click history over time.
//
// Rule (disclosed):
//   status unsubscribed/bounced          -> churned (explicit opt-out wins)
//   never sent anything                  -> new
//   sent but never opened/clicked,
//     created < 14 days ago              -> new (too early to judge)
//   sent but never opened/clicked,
//     created >= 14 days ago             -> at_risk
//   has engaged, last engagement <=30d   -> engaged
//   has engaged, last engagement <=90d   -> at_risk
//   has engaged, last engagement >90d    -> churned
export function classifyLifecycleStage(params: {
  status: string;
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  lastEngagedAt: Date | null;
  createdAt: Date;
  now: Date;
}): LifecycleStage {
  if (params.status === 'unsubscribed' || params.status === 'bounced') return 'churned';
  if (params.totalSent === 0) return 'new';

  const hasEngaged = params.totalOpens > 0 || params.totalClicks > 0;
  const daysSinceCreated = (params.now.getTime() - params.createdAt.getTime()) / 86_400_000;

  if (!hasEngaged) {
    return daysSinceCreated < 14 ? 'new' : 'at_risk';
  }

  const daysSinceEngaged = params.lastEngagedAt ? (params.now.getTime() - params.lastEngagedAt.getTime()) / 86_400_000 : Infinity;
  if (daysSinceEngaged <= 30) return 'engaged';
  if (daysSinceEngaged <= 90) return 'at_risk';
  return 'churned';
}

// 0-100, weighted 70% real engagement rate (opens+clicks / sent, capped
// at 1.0 so a contact who clicked every email doesn't exceed the cap)
// + 30% recency (linear decay to 0 over 90 days since last real
// engagement). A contact with zero sends scores 0, never a fabricated
// baseline.
export function computeActivationScore(params: {
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  lastEngagedAt: Date | null;
  now: Date;
}): number {
  if (params.totalSent === 0) return 0;
  const engagementRate = Math.min((params.totalOpens + params.totalClicks) / params.totalSent, 1);
  let recencyFactor = 0;
  if (params.lastEngagedAt) {
    const daysSince = (params.now.getTime() - params.lastEngagedAt.getTime()) / 86_400_000;
    recencyFactor = Math.max(0, 1 - daysSince / 90);
  }
  const score = engagementRate * 70 + recencyFactor * 30;
  return Math.round(Math.min(100, Math.max(0, score)));
}

function lastEngagedAt(agg: ContactActivationAggregate): Date | null {
  const dates = [agg.lastOpenedAt, agg.lastClickedAt].filter((d): d is Date => d !== null);
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

export interface ActivationStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ContactActivationResult {
  runId: string;
  stages: ActivationStageResult[];
  totalContacts: number;
  byStage: Record<LifecycleStage, number>;
}

// Real, deterministic pass over every real contact -- computes and
// writes lifecycleStage/activationScore/lastEngagedAt from real
// aggregated campaign_recipients history. No LLM involved (this is the
// same "deterministic pipeline first" pattern as every other use case
// this session); the narrative agent below only narrates these results.
export async function runContactActivationPipeline(params: { triggeredBy?: string | null }): Promise<ContactActivationResult> {
  const stages: ActivationStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'contacts',
    operationName: 'pipeline_activation_scoring',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const now = new Date();
  const aggregates = getActivationAggregateForAllContacts();
  stages.push({ stage: 'fetch_engagement_aggregates', input: {}, process: 'Real SQL aggregation of campaign_recipients per contact, across every campaign they have ever received', output: `${aggregates.length} contacts`, status: 'ok' });

  const byStage: Record<LifecycleStage, number> = { new: 0, engaged: 0, at_risk: 0, churned: 0 };

  // Real fix, found by this session's own production-scale seeding: at
  // small (test-fixture) contact counts a per-row db.update().run() loop
  // is invisible, but at real volume (1,000+ contacts) each is a
  // separate auto-committed write, and the whole pass took 7+ real
  // seconds -- slow enough to trip a test timeout and to matter for a
  // real admin waiting on this pipeline. Wrapping the same per-row
  // writes in one transaction batches them into a single commit.
  db.transaction((tx) => {
    for (const agg of aggregates) {
      const engagedAt = lastEngagedAt(agg);
      const stage = classifyLifecycleStage({
        status: agg.status, totalSent: agg.totalSent, totalOpens: agg.totalOpens, totalClicks: agg.totalClicks,
        lastEngagedAt: engagedAt, createdAt: agg.createdAt, now,
      });
      const score = computeActivationScore({
        totalSent: agg.totalSent, totalOpens: agg.totalOpens, totalClicks: agg.totalClicks, lastEngagedAt: engagedAt, now,
      });
      byStage[stage]++;

      tx.update(schema.contacts).set({
        lifecycleStage: stage,
        activationScore: score,
        lastEngagedAt: engagedAt,
        updatedAt: now,
      }).where(eq(schema.contacts.id, agg.contactId)).run();
    }
  });

  stages.push({ stage: 'classify_and_write', input: { rule: 'unsubscribed/bounced->churned; 0 sent->new; sent+never engaged+<14d->new else at_risk; engaged<=30d->engaged; <=90d->at_risk; else churned' }, process: 'Apply the disclosed rule per contact and write lifecycle_stage/activation_score/last_engaged_at', output: byStage, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { totalContacts: aggregates.length, byStage } });
  return { runId, stages, totalContacts: aggregates.length, byStage };
}
