import { describe, it, expect, afterAll } from 'vitest';
import { computeDaysSinceLastObservation, classifyMonitoringFreshness, runCompetitorMonitorScanPipeline } from '@/lib/pipelines/competitor-campaign-monitor-pipeline';
import { createObservation, deleteObservation } from '@/lib/db/competitor-campaign-observation-queries';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

describe('computeDaysSinceLastObservation (pure)', () => {
  it('returns null when never observed (negative case)', () => {
    expect(computeDaysSinceLastObservation(null, new Date('2026-01-15'))).toBeNull();
  });
  it('computes a real exact day difference (positive case)', () => {
    expect(computeDaysSinceLastObservation(new Date('2026-01-01'), new Date('2026-01-15'))).toBe(14);
  });
});

describe('classifyMonitoringFreshness (pure)', () => {
  it('classifies never-observed as no_data (negative case)', () => {
    expect(classifyMonitoringFreshness(null, 30)).toBe('no_data');
  });
  it('classifies within-threshold as active (positive case)', () => {
    expect(classifyMonitoringFreshness(10, 30)).toBe('active');
  });
  it('classifies beyond-threshold as stale (negative case)', () => {
    expect(classifyMonitoringFreshness(31, 30)).toBe('stale');
  });
  it('classifies exactly at the threshold as active, not stale (boundary)', () => {
    expect(classifyMonitoringFreshness(30, 30)).toBe('active');
  });
});

const cleanupObservationIds: string[] = [];
const cleanupCompetitorIds: string[] = [];

afterAll(() => {
  for (const id of cleanupObservationIds) deleteObservation(id);
  for (const id of cleanupCompetitorIds) db.delete(schema.competitorAnalysis).where(eq(schema.competitorAnalysis.id, id)).run();
});

function createTestCompetitor(name: string) {
  const id = randomUUID();
  const now = new Date();
  const service = db.select().from(schema.services).limit(1).get();
  db.insert(schema.competitorAnalysis).values({
    id, serviceId: service!.id, competitorName: name, status: 'monitoring', isTemplate: false, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

describe('runCompetitorMonitorScanPipeline (real DB)', () => {
  it('classifies a real competitor with a real recent observation as active, and one with zero observations as no_data (positive + negative case)', async () => {
    const activeCompetitorId = createTestCompetitor(`__test_active_competitor_${Date.now()}`);
    const noDataCompetitorId = createTestCompetitor(`__test_nodata_competitor_${Date.now()}`);
    cleanupCompetitorIds.push(activeCompetitorId, noDataCompetitorId);

    const obsId = createObservation({
      competitorId: activeCompetitorId, observedAt: new Date(), channel: 'paid_social', campaignType: 'promotion',
      description: '__test observed a real 20% off promo on Instagram',
    });
    cleanupObservationIds.push(obsId);

    const result = await runCompetitorMonitorScanPipeline({ staleThresholdDays: 30 });
    const activeSummary = result.summaries.find((s) => s.competitorId === activeCompetitorId);
    const noDataSummary = result.summaries.find((s) => s.competitorId === noDataCompetitorId);

    expect(activeSummary?.freshness).toBe('active');
    expect(activeSummary?.observationCount).toBe(1);
    expect(noDataSummary?.freshness).toBe('no_data');
    expect(noDataSummary?.observationCount).toBe(0);
  });
});
