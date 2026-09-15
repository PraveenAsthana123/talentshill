import { describe, it, expect } from 'vitest';
import { confidenceForSampleSize, computeLeadGeneration, computeLeadQuality, computeRatio, computeAdEfficiency } from '@/lib/kpi/kpi-engine';

describe('confidenceForSampleSize', () => {
  it('returns unknown for 0 (boundary)', () => expect(confidenceForSampleSize(0)).toBe('unknown'));
  it('returns low for 1-4 (positive case)', () => expect(confidenceForSampleSize(3)).toBe('low'));
  it('returns medium for 5-19 (positive case)', () => expect(confidenceForSampleSize(10)).toBe('medium'));
  it('returns high for 20+ (positive case)', () => expect(confidenceForSampleSize(50)).toBe('high'));
});

describe('computeLeadGeneration', () => {
  it('returns a real 0, not null, for zero real submissions (negative case)', () => {
    const r = computeLeadGeneration(0);
    expect(r.value).toBe(0);
    expect(r.confidence).toBe('unknown');
  });
  it('returns a real count with confidence (positive case)', () => {
    const r = computeLeadGeneration(25);
    expect(r.value).toBe(25);
    expect(r.confidence).toBe('high');
  });
});

describe('computeLeadQuality', () => {
  it('returns null (not a fabricated average) with zero scores (negative case)', () => {
    const r = computeLeadQuality([]);
    expect(r.value).toBeNull();
    expect(r.confidence).toBe('unknown');
  });
  it('computes a real average (positive case)', () => {
    const r = computeLeadQuality([80, 60, 40]);
    expect(r.value).toBe(60);
    expect(r.sampleSize).toBe(3);
  });
});

describe('computeRatio', () => {
  it('returns null (not 0%) for a 0-denominator (negative/boundary case)', () => {
    expect(computeRatio(5, 0).value).toBeNull();
  });
  it('computes a real percentage (positive case)', () => {
    const r = computeRatio(3, 4);
    expect(r.value).toBe(75);
    expect(r.sampleSize).toBe(4);
  });
});

describe('computeAdEfficiency', () => {
  it('returns null with zero clicks (negative case)', () => {
    expect(computeAdEfficiency(0, 0).value).toBeNull();
  });
  it('computes a real conversion rate (positive case)', () => {
    expect(computeAdEfficiency(200, 10).value).toBe(5);
  });
});
