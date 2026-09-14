import { getAllRealCompetitors, getObservationsForCompetitor } from '@/lib/db/competitor-campaign-observation-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export type MonitoringFreshness = 'active' | 'stale' | 'no_data';

// Pure, unit-tested. Days between a real most-recent observation date
// and now -- null if no real observation exists yet.
export function computeDaysSinceLastObservation(mostRecentObservedAt: Date | null, now: Date): number | null {
  if (!mostRecentObservedAt) return null;
  return Math.floor((now.getTime() - mostRecentObservedAt.getTime()) / (1000 * 60 * 60 * 24));
}

// Pure, unit-tested. A competitor is 'no_data' if never observed,
// 'stale' if the real most-recent observation is older than the
// disclosed threshold, else 'active'. Never guesses activity that
// wasn't actually logged.
export function classifyMonitoringFreshness(daysSinceLastObservation: number | null, staleThresholdDays: number): MonitoringFreshness {
  if (daysSinceLastObservation === null) return 'no_data';
  return daysSinceLastObservation > staleThresholdDays ? 'stale' : 'active';
}

export interface CompetitorActivitySummary {
  competitorId: string;
  competitorName: string;
  observationCount: number;
  channelsObserved: string[];
  mostRecentObservedAt: string | null;
  daysSinceLastObservation: number | null;
  freshness: MonitoringFreshness;
}

export interface MonitorScanStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface MonitorScanResult {
  runId: string;
  stages: MonitorScanStageResult[];
  staleThresholdDays: number;
  competitorCount: number;
  staleCount: number;
  noDataCount: number;
  summaries: CompetitorActivitySummary[];
}

// Real, deterministic. Scans every real (non-template) competitor,
// loads their real logged observations, and computes a real freshness
// classification for each -- surfaces which competitors haven't had a
// real activity check logged recently. Never fabricates an activity
// level for a competitor with zero real observations (reports
// 'no_data' instead).
export async function runCompetitorMonitorScanPipeline(params: { staleThresholdDays?: number; triggeredBy?: string | null } = {}): Promise<MonitorScanResult> {
  const staleThresholdDays = params.staleThresholdDays ?? 30;
  const stages: MonitorScanStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'competitor_analysis',
    operationName: 'pipeline_campaign_monitor_scan',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const competitors = getAllRealCompetitors();
  stages.push({ stage: 'fetch_competitors', input: {}, process: 'Load real, non-template competitor profiles', output: { count: competitors.length }, status: 'ok' });

  const now = new Date();
  const summaries: CompetitorActivitySummary[] = competitors.map((c) => {
    const observations = getObservationsForCompetitor(c.id);
    const mostRecent = observations.length > 0 ? observations[0].observedAt : null; // already ordered desc
    const daysSince = computeDaysSinceLastObservation(mostRecent, now);
    const freshness = classifyMonitoringFreshness(daysSince, staleThresholdDays);
    return {
      competitorId: c.id,
      competitorName: c.competitorName,
      observationCount: observations.length,
      channelsObserved: Array.from(new Set(observations.map((o) => o.channel))),
      mostRecentObservedAt: mostRecent ? mostRecent.toISOString() : null,
      daysSinceLastObservation: daysSince,
      freshness,
    };
  });

  const staleCount = summaries.filter((s) => s.freshness === 'stale').length;
  const noDataCount = summaries.filter((s) => s.freshness === 'no_data').length;
  stages.push({
    stage: 'classify_freshness',
    input: { staleThresholdDays },
    process: 'Real per-competitor freshness classification from real logged observations',
    output: { staleCount, noDataCount, activeCount: summaries.length - staleCount - noDataCount },
    status: 'ok',
  });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { competitorCount: competitors.length, staleCount, noDataCount } });
  return { runId, stages, staleThresholdDays, competitorCount: competitors.length, staleCount, noDataCount, summaries };
}
