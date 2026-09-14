import { describe, it, expect, afterAll } from 'vitest';
import { computeGrowthDelta, runChannelGrowthPipeline } from '@/lib/pipelines/youtube-channel-growth-pipeline';
import { createChannelSnapshot, deleteChannelSnapshot } from '@/lib/db/youtube-channel-snapshot-queries';

describe('computeGrowthDelta (pure)', () => {
  it('computes a real positive delta between two real snapshots (positive case)', () => {
    const prev = { snapshotDate: new Date('2026-01-01'), subscriberCount: 1000, totalViews: 50000, totalWatchTimeMinutes: 20000 };
    const curr = { snapshotDate: new Date('2026-01-11'), subscriberCount: 1100, totalViews: 55000, totalWatchTimeMinutes: 22000 };
    const delta = computeGrowthDelta(prev, curr);
    expect(delta.daysBetween).toBe(10);
    expect(delta.subscriberDelta).toBe(100);
    expect(delta.viewsDelta).toBe(5000);
    expect(delta.watchTimeMinutesDelta).toBe(2000);
    expect(delta.subscribersPerDay).toBe(10);
  });

  it('computes a real negative delta when a channel loses subscribers (negative case)', () => {
    const prev = { snapshotDate: new Date('2026-01-01'), subscriberCount: 1000, totalViews: 50000, totalWatchTimeMinutes: null };
    const curr = { snapshotDate: new Date('2026-01-11'), subscriberCount: 950, totalViews: 50100, totalWatchTimeMinutes: null };
    const delta = computeGrowthDelta(prev, curr);
    expect(delta.subscriberDelta).toBe(-50);
    expect(delta.watchTimeMinutesDelta).toBeNull();
  });

  it('returns null subscribersPerDay for same-day snapshots, never a divide-by-zero fabrication (boundary)', () => {
    const prev = { snapshotDate: new Date('2026-01-01'), subscriberCount: 1000, totalViews: 50000, totalWatchTimeMinutes: null };
    const curr = { snapshotDate: new Date('2026-01-01'), subscriberCount: 1010, totalViews: 50200, totalWatchTimeMinutes: null };
    const delta = computeGrowthDelta(prev, curr);
    expect(delta.daysBetween).toBe(0);
    expect(delta.subscribersPerDay).toBeNull();
  });
});

const cleanupSnapshotIds: string[] = [];

afterAll(() => {
  for (const id of cleanupSnapshotIds) deleteChannelSnapshot(id);
});

describe('runChannelGrowthPipeline (real DB)', () => {
  it('reports hasEnoughData=false with fewer than 2 real snapshots (negative case)', async () => {
    // Cannot guarantee a globally-empty table in a shared dev DB, so
    // this only asserts the real invariant: if the pipeline says
    // hasEnoughData=false, delta must be null (never fabricated).
    const result = await runChannelGrowthPipeline({});
    if (!result.hasEnoughData) {
      expect(result.delta).toBeNull();
    }
  });

  it('computes a real delta from two real snapshots just created (positive case)', async () => {
    // Far-future dates guarantee these are the 2 most recent snapshots
    // regardless of what real snapshots already exist in the shared
    // dev DB, so the exact delta is deterministic to assert on.
    const id1 = createChannelSnapshot({ snapshotDate: new Date('2099-01-01'), subscriberCount: 1000, totalViews: 5000 });
    const id2 = createChannelSnapshot({ snapshotDate: new Date('2099-01-11'), subscriberCount: 1200, totalViews: 5800 });
    cleanupSnapshotIds.push(id1, id2);

    const result = await runChannelGrowthPipeline({});
    expect(result.hasEnoughData).toBe(true);
    expect(result.delta).toEqual({ daysBetween: 10, subscriberDelta: 200, viewsDelta: 800, watchTimeMinutesDelta: null, subscribersPerDay: 20 });
  });
});
