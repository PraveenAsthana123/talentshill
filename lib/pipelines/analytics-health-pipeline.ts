import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { sql, eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface HealthStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface AnalyticsHealthResult { runId: string; snapshotId: string; stages: HealthStageResult[]; score: number }

// Real, deterministic email-program health score, rolled up from the
// same campaigns/contacts data the existing analytics dashboard already
// reads. Benchmarks (25% open rate, 3% click rate, 1% bounce rate) are
// disclosed, typical email-marketing industry figures, not empirically
// validated for this specific business -- flagged in the Governance tab.
// Unlike other modules, there is no single entity to update in place, so
// each run inserts a new timestamped snapshot row instead.
//   open rate score (scaled to 25% benchmark)    30
//   click rate score (scaled to 3% benchmark)     30
//   bounce rate score (inverse, <=1%=20/<=2%=15/<=5%=5/else 0)  20
//   active-contact ratio (activeContacts/totalContacts, scaled)  20
export async function runAnalyticsHealthPipeline(params: { triggeredBy?: string | null }): Promise<AnalyticsHealthResult> {
  const stages: HealthStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'analytics', operationName: 'pipeline_program_health_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const allCampaigns = db.select().from(schema.campaigns).all();
  const totalSent = allCampaigns.reduce((sum, c) => sum + (c.totalSent || 0), 0);
  const totalOpened = allCampaigns.reduce((sum, c) => sum + (c.totalOpened || 0), 0);
  const totalClicked = allCampaigns.reduce((sum, c) => sum + (c.totalClicked || 0), 0);
  const totalBounced = allCampaigns.reduce((sum, c) => sum + (c.totalBounced || 0), 0);
  const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
  const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;

  const totalContacts = db.select({ count: sql<number>`count(*)` }).from(schema.contacts).get()?.count || 0;
  const activeContacts = db.select({ count: sql<number>`count(*)` }).from(schema.contacts).where(eq(schema.contacts.status, 'active')).get()?.count || 0;

  const openRateScore = Math.min(30, Math.round((openRate / 25) * 30));
  stages.push({ stage: 'open_rate_check', input: `${openRate.toFixed(1)}% (benchmark 25%)`, process: 'Score up to 30, scaled to a 25% open-rate benchmark', output: openRateScore, status: 'ok' });

  const clickRateScore = Math.min(30, Math.round((clickRate / 3) * 30));
  stages.push({ stage: 'click_rate_check', input: `${clickRate.toFixed(1)}% (benchmark 3%)`, process: 'Score up to 30, scaled to a 3% click-rate benchmark', output: clickRateScore, status: 'ok' });

  const bounceRateScore = bounceRate <= 1 ? 20 : bounceRate <= 2 ? 15 : bounceRate <= 5 ? 5 : 0;
  stages.push({ stage: 'bounce_rate_check', input: `${bounceRate.toFixed(1)}%`, process: 'Score 20 if <=1%, 15 if <=2%, 5 if <=5%, else 0', output: bounceRateScore, status: 'ok' });

  const activeRatio = totalContacts > 0 ? activeContacts / totalContacts : 0;
  const contactHealthScore = Math.round(activeRatio * 20);
  stages.push({ stage: 'contact_health_check', input: `${activeContacts}/${totalContacts} active`, process: 'Score up to 20, proportional to activeContacts/totalContacts', output: contactHealthScore, status: 'ok' });

  const totalScore = openRateScore + clickRateScore + bounceRateScore + contactHealthScore;
  const snapshotId = randomUUID();
  db.insert(schema.analyticsSnapshots).values({
    id: snapshotId,
    healthScore: totalScore,
    openRateScore,
    clickRateScore,
    bounceRateScore,
    contactHealthScore,
    inputSnapshot: JSON.stringify({ totalSent, totalOpened, totalClicked, totalBounced, openRate, clickRate, bounceRate, totalContacts, activeContacts }),
    triggeredBy: params.triggeredBy || null,
    createdAt: new Date(),
  }).run();
  stages.push({ stage: 'write_snapshot', input: { totalScore }, process: 'Insert a new analytics_snapshots row (point-in-time, not an update-in-place)', output: { snapshotId, healthScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore, snapshotId } });
  return { runId, snapshotId, stages, score: totalScore };
}
