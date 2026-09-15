import { describe, it, expect } from 'vitest';
import { computeFunnelConstraint, type FunnelStage } from '@/lib/diagnostic/business-diagnostic';

describe('computeFunnelConstraint', () => {
  it('identifies the real weakest transition (positive case)', () => {
    const counts: Record<FunnelStage, number> = { unqualified: 100, mql: 60, sql: 50, opportunity: 10, customer: 8 };
    const result = computeFunnelConstraint(counts);
    // sql -> opportunity: 10/50 = 20%, the lowest of all transitions
    expect(result.constraint?.fromStage).toBe('sql');
    expect(result.constraint?.toStage).toBe('opportunity');
    expect(result.constraint?.conversionRate).toBe(20);
  });

  it('returns null conversionRate for a transition with a zero denominator (negative/boundary case)', () => {
    const counts: Record<FunnelStage, number> = { unqualified: 0, mql: 0, sql: 0, opportunity: 0, customer: 0 };
    const result = computeFunnelConstraint(counts);
    expect(result.transitions.every((t) => t.conversionRate === null)).toBe(true);
    expect(result.constraint).toBeNull();
  });

  it('produces exactly 4 transitions for the 5-stage funnel (consistency)', () => {
    const counts: Record<FunnelStage, number> = { unqualified: 10, mql: 8, sql: 6, opportunity: 4, customer: 2 };
    expect(computeFunnelConstraint(counts).transitions.length).toBe(4);
  });
});
