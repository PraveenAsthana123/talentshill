import { getPerformanceAggregateForAllContent, type ContentPerformanceAggregate } from '@/lib/db/content-engagement-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface PerformanceStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }

export interface ContentOptimizationSuggestion {
  contentId: string;
  title: string;
  contentType: string;
  conversionRate: number | null;
  action: 'produce_more' | 'hold' | 'deprioritize';
  reason: string;
}

export interface ContentPerformanceResult {
  runId: string;
  stages: PerformanceStageResult[];
  scoredContent: number;
  unscoredContent: number;
  suggestions: ContentOptimizationSuggestion[];
}

// Pure classification rule, unit-tested in isolation (same lesson learned
// from ads_management/influencer_video: rank-dependent rules must not be
// tested against a shared, uncontrolled dev DB).
//
// Rule: conversion rate (leads/views) in the top half of scored content
// -> produce_more. Bottom half but nonzero views -> deprioritize.
// Everything else (no data) -> hold.
export function classifyContentAction(
  c: Pick<ContentPerformanceAggregate, 'contentId' | 'title' | 'contentType' | 'conversionRate' | 'totalViews' | 'totalLeads'>,
  idx: number,
  totalScored: number,
): ContentOptimizationSuggestion {
  const topHalfCutoff = Math.floor((totalScored - 1) / 2);
  if (c.conversionRate === null) {
    return { contentId: c.contentId, title: c.title, contentType: c.contentType, conversionRate: null, action: 'hold', reason: 'No engagement data logged yet' };
  }
  if (idx <= topHalfCutoff) {
    return {
      contentId: c.contentId, title: c.title, contentType: c.contentType, conversionRate: c.conversionRate, action: 'produce_more',
      reason: `Conversion rate ${(c.conversionRate * 100).toFixed(1)}% (${c.totalLeads} leads / ${c.totalViews} views) is in the top half of scored content (rank ${idx + 1} of ${totalScored})`,
    };
  }
  return {
    contentId: c.contentId, title: c.title, contentType: c.contentType, conversionRate: c.conversionRate, action: 'deprioritize',
    reason: `Conversion rate ${(c.conversionRate * 100).toFixed(1)}% is in the bottom half of scored content`,
  };
}

export async function runContentPerformancePipeline(params: { triggeredBy?: string | null }): Promise<ContentPerformanceResult> {
  const stages: PerformanceStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'content',
    operationName: 'pipeline_content_performance',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const all = getPerformanceAggregateForAllContent();
  const scored = all.filter((c) => c.conversionRate !== null);
  const unscored = all.filter((c) => c.conversionRate === null);

  stages.push({
    stage: 'fetch_engagement_aggregates',
    input: { totalContent: all.length },
    process: 'SUM real content_engagement_metrics rows per content item; exclude items with no views logged',
    output: { scored: scored.length, unscored: unscored.length },
    status: 'ok',
  });

  const ranked = [...scored].sort((a, b) => (b.conversionRate ?? -Infinity) - (a.conversionRate ?? -Infinity));
  stages.push({
    stage: 'rank_by_conversion_rate',
    input: { count: ranked.length },
    process: 'Sort scored content descending by leads/views',
    output: ranked.map((c) => ({ contentId: c.contentId, title: c.title, conversionRate: c.conversionRate })),
    status: 'ok',
  });

  const suggestions = ranked.map((c, idx) => classifyContentAction(c, idx, ranked.length));
  stages.push({
    stage: 'compute_optimization_suggestions',
    input: { rule: 'top half by conversion rate -> produce_more, bottom half -> deprioritize, no data -> hold' },
    process: 'Apply the disclosed deterministic rule per content item',
    output: suggestions,
    status: 'ok',
  });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { scoredContent: scored.length, unscoredContent: unscored.length, suggestionCount: suggestions.length } });
  return { runId, stages, scoredContent: scored.length, unscoredContent: unscored.length, suggestions };
}
