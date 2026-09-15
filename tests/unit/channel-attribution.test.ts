import { describe, it, expect } from 'vitest';
import { getChannelConversionRates, getDuplicateLeadTouches } from '@/lib/marketing/channel-attribution';

describe('getChannelConversionRates (real DB integration)', () => {
  it('returns an array without throwing against the real dev DB (smoke test)', () => {
    const results = getChannelConversionRates();
    expect(Array.isArray(results)).toBe(true);
    for (const r of results) {
      expect(r.total).toBeGreaterThan(0);
      expect(r.engaged).toBeLessThanOrEqual(r.total);
    }
  });
});

describe('getDuplicateLeadTouches (real DB integration)', () => {
  it('computes a real duplicate count consistent with real totals (consistency check)', () => {
    const result = getDuplicateLeadTouches();
    expect(result.duplicateTouches).toBe(result.totalSubmissions - result.uniqueEmails);
    expect(result.duplicateTouches).toBeGreaterThanOrEqual(0);
  });
});
