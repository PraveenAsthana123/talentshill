import { describe, it, expect } from 'vitest';
import { computeComposite } from '@/lib/research/assessment-engine';

describe('computeComposite', () => {
  it('throws with zero real dimension scores (negative case)', () => {
    expect(() => computeComposite([])).toThrow(/at least one/);
  });

  it('computes the real average across multiple dimensions (positive case)', () => {
    const score = computeComposite([
      { dimension: 'growth', score: 80, rationale: 'strong' },
      { dimension: 'competition', score: 40, rationale: 'crowded' },
      { dimension: 'regulation', score: 60, rationale: 'moderate' },
    ]);
    expect(score).toBe(60);
  });

  it('returns the single score unchanged with one dimension (boundary case)', () => {
    expect(computeComposite([{ dimension: 'x', score: 73, rationale: 'r' }])).toBe(73);
  });
});
