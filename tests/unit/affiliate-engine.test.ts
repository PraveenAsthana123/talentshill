import { describe, it, expect } from 'vitest';
import { checkFraudHeuristic } from '@/lib/affiliate/affiliate-engine';

describe('checkFraudHeuristic', () => {
  it('flags a conversion that happens under 2 seconds after the click (negative case, likely bot/self-click)', () => {
    const clicked = new Date('2026-01-01T00:00:00.000Z');
    const converted = new Date('2026-01-01T00:00:01.500Z');
    const r = checkFraudHeuristic(clicked, converted);
    expect(r.flagged).toBe(true);
    expect(r.reason).toMatch(/1500ms/);
  });

  it('does not flag a real-looking gap of several minutes (positive case)', () => {
    const clicked = new Date('2026-01-01T00:00:00.000Z');
    const converted = new Date('2026-01-01T00:05:00.000Z');
    const r = checkFraudHeuristic(clicked, converted);
    expect(r.flagged).toBe(false);
    expect(r.reason).toBeNull();
  });

  it('treats exactly 2000ms as the boundary -- not flagged (boundary case)', () => {
    const clicked = new Date('2026-01-01T00:00:00.000Z');
    const converted = new Date('2026-01-01T00:00:02.000Z');
    const r = checkFraudHeuristic(clicked, converted);
    expect(r.flagged).toBe(false);
  });
});
