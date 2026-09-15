import { describe, it, expect } from 'vitest';
import { computeConversionReadinessScore } from '@/lib/cro/friction-engine';

describe('computeConversionReadinessScore', () => {
  it('returns 100 with zero open findings (boundary case)', () => {
    expect(computeConversionReadinessScore([])).toBe(100);
  });

  it('penalizes a high-severity finding more than several low-severity ones (positive case)', () => {
    const oneHigh = computeConversionReadinessScore([5]);
    const fiveLow = computeConversionReadinessScore([1, 1, 1, 1, 1]);
    expect(oneHigh).toBeLessThan(100);
    expect(fiveLow).toBeLessThan(100);
    // severity^1.5 weighting: 5^1.5=11.18 vs 5*(1^1.5)=5 -- one severity-5
    // finding costs more than five severity-1 findings
    expect(100 - oneHigh).toBeGreaterThan(100 - fiveLow);
  });

  it('never goes below 0 even with many severe findings (negative/boundary case)', () => {
    expect(computeConversionReadinessScore([5, 5, 5, 5, 5, 5, 5, 5])).toBe(0);
  });
});
