import { describe, it, expect } from 'vitest';
import { projectScenario } from '@/lib/kpi/growth-scenario';

describe('projectScenario', () => {
  it('returns the exact real current value at month 0 for all 3 rates (boundary case)', () => {
    const points = projectScenario(100, 3);
    expect(points[0]).toEqual({ month: 0, conservative: 100, moderate: 100, aggressive: 100 });
  });

  it('compounds correctly at the disclosed rates (positive case)', () => {
    const points = projectScenario(100, 1);
    // 100 * 1.02 = 102, 100 * 1.05 = 105, 100 * 1.10 = 110
    expect(points[1]).toEqual({ month: 1, conservative: 102, moderate: 105, aggressive: 110 });
  });

  it('aggressive always outpaces moderate which always outpaces conservative beyond month 0 (consistency)', () => {
    const points = projectScenario(50, 6);
    for (const p of points.slice(1)) {
      expect(p.aggressive).toBeGreaterThan(p.moderate);
      expect(p.moderate).toBeGreaterThan(p.conservative);
    }
  });

  it('produces months+1 points (consistency)', () => {
    expect(projectScenario(10, 12).length).toBe(13);
  });
});
