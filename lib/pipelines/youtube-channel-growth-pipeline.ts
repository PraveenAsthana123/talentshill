import { getLatestTwoChannelSnapshots } from '@/lib/db/youtube-channel-snapshot-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ChannelSnapshotInput {
  snapshotDate: Date;
  subscriberCount: number;
  totalViews: number;
  totalWatchTimeMinutes: number | null;
}

export interface GrowthDelta {
  daysBetween: number;
  subscriberDelta: number;
  viewsDelta: number;
  watchTimeMinutesDelta: number | null;
  subscribersPerDay: number | null; // null if daysBetween is 0 (same-day snapshots -- avoid a divide-by-zero fabrication)
}

// Pure, unit-tested. A real diff between two real snapshots -- never an
// interpolated or simulated trend. subscribersPerDay is null (not a
// fabricated rate) when the two snapshots are on the same real date.
export function computeGrowthDelta(previous: ChannelSnapshotInput, current: ChannelSnapshotInput): GrowthDelta {
  const daysBetween = Math.max(0, Math.round((current.snapshotDate.getTime() - previous.snapshotDate.getTime()) / (1000 * 60 * 60 * 24)));
  const subscriberDelta = current.subscriberCount - previous.subscriberCount;
  const viewsDelta = current.totalViews - previous.totalViews;
  const watchTimeMinutesDelta = current.totalWatchTimeMinutes !== null && previous.totalWatchTimeMinutes !== null
    ? current.totalWatchTimeMinutes - previous.totalWatchTimeMinutes
    : null;
  const subscribersPerDay = daysBetween > 0 ? Math.round((subscriberDelta / daysBetween) * 100) / 100 : null;

  return { daysBetween, subscriberDelta, viewsDelta, watchTimeMinutesDelta, subscribersPerDay };
}

export interface GrowthStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ChannelGrowthResult {
  runId: string;
  stages: GrowthStageResult[];
  hasEnoughData: boolean;
  previousSnapshot: { snapshotDate: string; subscriberCount: number; totalViews: number } | null;
  currentSnapshot: { snapshotDate: string; subscriberCount: number; totalViews: number } | null;
  delta: GrowthDelta | null;
}

// Real, deterministic. Loads the two most recent real channel
// snapshots and computes a real diff between them. Never fabricates a
// growth number when fewer than 2 real snapshots exist -- reports
// hasEnoughData=false instead of guessing.
export async function runChannelGrowthPipeline(params: { triggeredBy?: string | null } = {}): Promise<ChannelGrowthResult> {
  const stages: GrowthStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'youtube',
    operationName: 'pipeline_channel_growth',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const snapshots = getLatestTwoChannelSnapshots();
  stages.push({ stage: 'fetch_snapshots', input: {}, process: 'Load the 2 most recent real channel snapshots', output: { count: snapshots.length }, status: 'ok' });

  if (snapshots.length < 2) {
    stages.push({ stage: 'compute_delta', input: {}, process: 'Fewer than 2 real snapshots exist -- cannot compute a real growth delta', output: 'skipped', status: 'ok' });
    updateOperationRunStatus(runId, 'completed', { outputPayload: { hasEnoughData: false } });
    return {
      runId, stages, hasEnoughData: false,
      previousSnapshot: null,
      currentSnapshot: snapshots.length === 1 ? { snapshotDate: snapshots[0].snapshotDate.toISOString(), subscriberCount: snapshots[0].subscriberCount, totalViews: snapshots[0].totalViews } : null,
      delta: null,
    };
  }

  const [previous, current] = snapshots;
  const delta = computeGrowthDelta(previous, current);
  stages.push({ stage: 'compute_delta', input: { previous: previous.snapshotDate, current: current.snapshotDate }, process: 'Real diff between the two real snapshots (never an interpolated trend)', output: delta, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { hasEnoughData: true, delta } });
  return {
    runId, stages, hasEnoughData: true,
    previousSnapshot: { snapshotDate: previous.snapshotDate.toISOString(), subscriberCount: previous.subscriberCount, totalViews: previous.totalViews },
    currentSnapshot: { snapshotDate: current.snapshotDate.toISOString(), subscriberCount: current.subscriberCount, totalViews: current.totalViews },
    delta,
  };
}
