import { describe, it, expect } from 'vitest';
import { calculateTamSamSom, calculateNps, calculateVanWestendorp } from '@/lib/research/calculators';

describe('calculateTamSamSom', () => {
  it('throws on non-positive TAM (negative case)', () => {
    expect(() => calculateTamSamSom({ tamDollars: 0, samPercentOfTam: 10, somPercentOfSam: 10 })).toThrow(/positive/);
  });

  it('computes real SAM/SOM from real percentages (positive case)', () => {
    const r = calculateTamSamSom({ tamDollars: 1_000_000, samPercentOfTam: 20, somPercentOfSam: 10 });
    expect(r.samDollars).toBe(200_000);
    expect(r.somDollars).toBe(20_000);
  });

  it('throws when samPercentOfTam exceeds 100 (boundary/negative case)', () => {
    expect(() => calculateTamSamSom({ tamDollars: 1000, samPercentOfTam: 150, somPercentOfSam: 10 })).toThrow(/0-100/);
  });
});

describe('calculateNps', () => {
  it('returns null with zero real respondents (negative case)', () => {
    expect(calculateNps({ promoters: 0, passives: 0, detractors: 0 })).toBeNull();
  });

  it('computes the real standard NPS formula (positive case)', () => {
    expect(calculateNps({ promoters: 60, passives: 20, detractors: 20 })).toBe(40);
  });

  it('returns -100 when all real respondents are detractors (boundary case)', () => {
    expect(calculateNps({ promoters: 0, passives: 0, detractors: 10 })).toBe(-100);
  });
});

describe('calculateVanWestendorp', () => {
  it('throws when a question has zero real answers (negative case)', () => {
    expect(() => calculateVanWestendorp({ tooCheap: [], cheap: [10], expensive: [20], tooExpensive: [30] })).toThrow(/at least one/);
  });

  it('computes real medians and the disclosed acceptable range (positive case)', () => {
    const r = calculateVanWestendorp({ tooCheap: [5, 7, 9], cheap: [10, 12, 14], expensive: [20, 22, 24], tooExpensive: [30, 32, 34] });
    expect(r.medianCheap).toBe(12);
    expect(r.medianExpensive).toBe(22);
    expect(r.acceptableRangeLow).toBe(12);
    expect(r.acceptableRangeHigh).toBe(22);
  });
});
