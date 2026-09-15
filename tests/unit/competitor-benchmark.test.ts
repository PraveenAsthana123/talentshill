import { describe, it, expect } from 'vitest';
import { computeHeadToHead, DIMENSIONS } from '@/lib/competitor/competitor-benchmark';

describe('computeHeadToHead', () => {
  it('returns a null gap when the competitor has no real score yet (negative case)', () => {
    const rows = computeHeadToHead({ pricing_value: 80 }, {});
    const row = rows.find((r) => r.dimension === 'pricing_value')!;
    expect(row.gap).toBeNull();
    expect(row.competitorScore).toBeNull();
  });

  it('computes a real positive gap when TalentsHill scores higher (positive case)', () => {
    const rows = computeHeadToHead({ digital_presence: 70 }, { digital_presence: 55 });
    const row = rows.find((r) => r.dimension === 'digital_presence')!;
    expect(row.gap).toBe(15);
  });

  it('computes a real negative gap when the competitor scores higher (positive case)', () => {
    const rows = computeHeadToHead({ market_reach: 40 }, { market_reach: 65 });
    const row = rows.find((r) => r.dimension === 'market_reach')!;
    expect(row.gap).toBe(-25);
  });

  it('covers all 8 real dimensions (consistency)', () => {
    const rows = computeHeadToHead({}, {});
    expect(rows.length).toBe(8);
    expect(rows.map((r) => r.dimension).sort()).toEqual([...DIMENSIONS].sort());
  });
});
