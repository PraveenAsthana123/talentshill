import { describe, it, expect } from 'vitest';
import { computePmfScore } from '@/lib/pmf/pmf-tracking';

describe('computePmfScore', () => {
  it('returns null (not 0%) with zero real responses (negative case)', () => {
    const r = computePmfScore(0, 0);
    expect(r.score).toBeNull();
    expect(r.hasSignal).toBe(false);
  });

  it('flags hasSignal=true at exactly the 40% Sean Ellis threshold (boundary case)', () => {
    expect(computePmfScore(4, 10).score).toBe(40);
    expect(computePmfScore(4, 10).hasSignal).toBe(true);
  });

  it('flags hasSignal=false below the threshold (negative case)', () => {
    expect(computePmfScore(3, 10).hasSignal).toBe(false);
  });

  it('computes a real percentage above threshold (positive case)', () => {
    const r = computePmfScore(7, 10);
    expect(r.score).toBe(70);
    expect(r.hasSignal).toBe(true);
  });
});
