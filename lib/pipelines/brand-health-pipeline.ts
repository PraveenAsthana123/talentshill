import { db, schema } from '@/lib/db/index';
import { isNotNull } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface HealthStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' | 'failed' }
export interface BrandHealthResult {
  runId: string;
  stages: HealthStageResult[];
  healthScore: number | null;
  totalMentions: number;
  scoredMentions: number;
  positiveMentions: number;
  neutralMentions: number;
  negativeMentions: number;
  competitorsTracked: number;
  snapshotId: string | null;
}

// Pure, unit-tested: net-sentiment ratio ((positive - negative) /
// scored) mapped from [-1, 1] to a 0-100 scale. Returns null when there
// is no scored data -- never a fabricated baseline (e.g. 50 "neutral by
// default").
export function computeHealthScore(positive: number, neutral: number, negative: number): number | null {
  const scored = positive + neutral + negative;
  if (scored === 0) return null;
  const netRatio = (positive - negative) / scored; // -1..1
  return Math.round(((netRatio + 1) / 2) * 100);
}

// Real, deterministic aggregation over real brandMentions (only those
// with a real sentiment already assigned by brand-mention-sentiment-agent.ts
// count toward the score -- unscored mentions are reported separately,
// never guessed at). competitorsTracked is an honest real count from
// competitor_analysis, not a fabricated competitive score -- no data
// exists in this codebase to support a real brand-vs-competitor numeric
// comparison (see architecture note).
export async function runBrandHealthPipeline(params: { label?: string; campaignId?: string; triggeredBy?: string | null }): Promise<BrandHealthResult> {
  const stages: HealthStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'branding',
    operationName: 'pipeline_brand_health_snapshot',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const all = db.select().from(schema.brandMentions).all();
  const scored = db.select().from(schema.brandMentions).where(isNotNull(schema.brandMentions.sentiment)).all();
  stages.push({ stage: 'fetch_mentions', input: {}, process: 'Read all real brand_mentions rows; only sentiment-scored ones count toward the health score', output: { total: all.length, scored: scored.length }, status: 'ok' });

  const positive = scored.filter((m) => m.sentiment === 'positive').length;
  const neutral = scored.filter((m) => m.sentiment === 'neutral').length;
  const negative = scored.filter((m) => m.sentiment === 'negative').length;
  stages.push({ stage: 'tally_sentiment', input: {}, process: 'Count real sentiment values already assigned by the sentiment agent', output: { positive, neutral, negative }, status: 'ok' });

  const healthScore = computeHealthScore(positive, neutral, negative);
  stages.push({ stage: 'compute_health_score', input: { rule: 'round(((positive-negative)/scored + 1) / 2 * 100), null if 0 scored' }, process: 'Apply the disclosed deterministic formula', output: { healthScore }, status: 'ok' });

  const competitorsTracked = db.select().from(schema.competitorAnalysis).all().length;
  stages.push({ stage: 'competitor_benchmark_context', input: {}, process: 'Real count from competitor_analysis -- informational context only, not a fabricated brand-vs-competitor score (no data exists to support one)', output: { competitorsTracked }, status: 'ok' });

  if (healthScore === null) {
    stages.push({ stage: 'write_snapshot', input: {}, process: 'No scored mentions -- nothing to snapshot', output: 'skipped', status: 'ok' });
    updateOperationRunStatus(runId, 'completed', { outputPayload: { healthScore: null, totalMentions: all.length } });
    return { runId, stages, healthScore: null, totalMentions: all.length, scoredMentions: 0, positiveMentions: 0, neutralMentions: 0, negativeMentions: 0, competitorsTracked, snapshotId: null };
  }

  const snapshotId = randomUUID();
  const now = new Date();
  db.insert(schema.brandHealthSnapshots).values({
    id: snapshotId, snapshotDate: now, healthScore, totalMentions: scored.length,
    positiveMentions: positive, neutralMentions: neutral, negativeMentions: negative,
    competitorsTracked, campaignId: params.campaignId, label: params.label, createdBy: params.triggeredBy ?? undefined, createdAt: now,
  }).run();
  stages.push({ stage: 'write_snapshot', input: { healthScore }, process: 'Insert a real brand_health_snapshots row', output: { snapshotId }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { healthScore, snapshotId } });
  return { runId, stages, healthScore, totalMentions: all.length, scoredMentions: scored.length, positiveMentions: positive, neutralMentions: neutral, negativeMentions: negative, competitorsTracked, snapshotId };
}

export interface CampaignLiftResult {
  preSnapshot: { id: string; healthScore: number; snapshotDate: Date } | null;
  postSnapshot: { id: string; healthScore: number; snapshotDate: Date } | null;
  lift: number | null; // post - pre, null if either snapshot missing
}

// Real diff between the two most recent snapshots tagged to a campaign
// (pre/post), never a fabricated "lift" number. Requires the admin to
// have actually taken two snapshots (one before, one after) -- see
// architecture note for why this can't be automatic.
export function computeCampaignLift(campaignId: string): CampaignLiftResult {
  const snapshots = db.select().from(schema.brandHealthSnapshots)
    .where(isNotNull(schema.brandHealthSnapshots.campaignId))
    .all()
    .filter((s) => s.campaignId === campaignId)
    .sort((a, b) => a.snapshotDate.getTime() - b.snapshotDate.getTime());

  if (snapshots.length === 0) return { preSnapshot: null, postSnapshot: null, lift: null };

  const pre = snapshots[0];
  const post = snapshots.length > 1 ? snapshots[snapshots.length - 1] : null;

  return {
    preSnapshot: { id: pre.id, healthScore: pre.healthScore, snapshotDate: pre.snapshotDate },
    postSnapshot: post ? { id: post.id, healthScore: post.healthScore, snapshotDate: post.snapshotDate } : null,
    lift: post ? post.healthScore - pre.healthScore : null,
  };
}
