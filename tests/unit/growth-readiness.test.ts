import { describe, it, expect } from 'vitest';
import { computeGrowthReadinessScore } from '@/lib/kpi/growth-readiness';

describe('computeGrowthReadinessScore', () => {
  it('returns null with zero real dimensions (negative case)', () => {
    const r = computeGrowthReadinessScore([{ dimension: 'lead_generation', value: null, confidence: 'unknown' }]);
    expect(r.score).toBeNull();
    expect(r.dimensionsIncluded).toBe(0);
  });

  it('excludes null-value dimensions from the average without dragging it to 0 (positive case)', () => {
    const r = computeGrowthReadinessScore([
      { dimension: 'operational_health', value: 90, confidence: 'high' },
      { dimension: 'ad_efficiency', value: null, confidence: 'unknown' },
    ]);
    expect(r.score).toBe(90);
    expect(r.dimensionsIncluded).toBe(1);
    expect(r.dimensionsExcluded).toBe(1);
  });

  it('normalizes a count-type dimension against its disclosed target (positive case)', () => {
    const r = computeGrowthReadinessScore([{ dimension: 'lead_generation', value: 25, confidence: 'high' }]);
    // target=50 -> 25/50*100 = 50
    expect(r.score).toBe(50);
  });

  it('weights lower-confidence dimensions less (positive case)', () => {
    const highOnly = computeGrowthReadinessScore([{ dimension: 'email_engagement', value: 80, confidence: 'high' }]);
    const lowOnly = computeGrowthReadinessScore([{ dimension: 'email_engagement', value: 80, confidence: 'low' }]);
    // Same real value either way (single-dimension average), but distinct
    // weight paths are exercised -- confirmed via a 2-dimension mix below.
    expect(highOnly.score).toBe(80);
    expect(lowOnly.score).toBe(80);
    const mixed = computeGrowthReadinessScore([
      { dimension: 'email_engagement', value: 100, confidence: 'high' },
      { dimension: 'webinar_engagement', value: 0, confidence: 'low' },
    ]);
    // high-confidence 100 should dominate over low-confidence 0
    expect(mixed.score).toBeGreaterThan(50);
  });

  it('caps a normalized value at 100 (boundary case)', () => {
    const r = computeGrowthReadinessScore([{ dimension: 'lead_generation', value: 500, confidence: 'high' }]);
    expect(r.score).toBe(100);
  });
});
