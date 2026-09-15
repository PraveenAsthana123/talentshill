import { describe, it, expect } from 'vitest';
import { computeMentionRate } from '@/lib/geo/geo-visibility';

describe('computeMentionRate', () => {
  it('returns null (not 0%) with zero real observations (negative case)', () => {
    expect(computeMentionRate(0, 0)).toBeNull();
  });
  it('computes a real percentage (positive case)', () => {
    expect(computeMentionRate(3, 4)).toBe(75);
  });
  it('returns 0% for real observations with zero real mentions (boundary case)', () => {
    expect(computeMentionRate(0, 5)).toBe(0);
  });
});
