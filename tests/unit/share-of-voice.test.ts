import { describe, it, expect } from 'vitest';
import { computePositiveShare } from '@/lib/pr/share-of-voice';

describe('computePositiveShare', () => {
  it('returns null (not 0%) with zero real mentions (negative case)', () => {
    expect(computePositiveShare(0, 0)).toBeNull();
  });
  it('computes a real percentage (positive case)', () => {
    expect(computePositiveShare(3, 4)).toBe(75);
  });
});
