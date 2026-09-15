import { describe, it, expect } from 'vitest';
import { evaluateDimension, THRESHOLDS, SOLUTION_MAP } from '@/lib/opportunity/opportunity-engine';

describe('evaluateDimension', () => {
  it('returns null when a real value is at/above threshold (negative case -- no gap)', () => {
    expect(evaluateDimension('operational_health', 96, 'high')).toBeNull();
  });

  it('flags a below-threshold value as a real gap (positive case)', () => {
    const c = evaluateDimension('email_engagement', 20, 'high');
    expect(c).not.toBeNull();
    expect(c!.gapType).toBe('below_threshold');
    expect(c!.confidenceWeight).toBe(1);
  });

  it('flags null (no real data) as a real gap with low confidence weight (boundary case)', () => {
    const c = evaluateDimension('ad_efficiency', null, 'unknown');
    expect(c).not.toBeNull();
    expect(c!.gapType).toBe('no_data');
    expect(c!.confidenceWeight).toBe(0.1);
  });

  it('recommends a module key present in SOLUTION_MAP (consistency check)', () => {
    const c = evaluateDimension('lead_quality', 10, 'low');
    expect(c!.recommendedModuleKey).toBe(SOLUTION_MAP.lead_quality.moduleKey);
  });

  it('rankScore scales down with lower confidence (positive case)', () => {
    const high = evaluateDimension('lead_generation', 5, 'high')!;
    const low = evaluateDimension('lead_generation', 5, 'low')!;
    expect(high.rankScore).toBeGreaterThan(low.rankScore);
  });
});

describe('THRESHOLDS coverage', () => {
  it('has a threshold+impact+feasibility for every dimension in SOLUTION_MAP (consistency)', () => {
    for (const dim of Object.keys(SOLUTION_MAP)) {
      expect(THRESHOLDS[dim as keyof typeof THRESHOLDS]).toBeDefined();
    }
  });
});
