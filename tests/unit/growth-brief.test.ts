import { describe, it, expect } from 'vitest';
import { formatGrowthBrief } from '@/lib/presales/growth-brief';

describe('formatGrowthBrief', () => {
  it('honestly reports insufficient data when readiness is null (negative case)', () => {
    const text = formatGrowthBrief([], null, null, 0);
    expect(text).toContain('insufficient real data yet');
    expect(text).toContain('none identified');
  });

  it('includes real KPI values and the real top opportunity (positive case)', () => {
    const text = formatGrowthBrief(
      [{ dimension: 'lead_generation', value: 42, unit: 'count', confidence: 'high' }],
      75.5,
      { dimension: 'lead_quality', rationale: 'Tighten qualification.' },
      12,
    );
    expect(text).toContain('75.5/100');
    expect(text).toContain('lead_generation: 42');
    expect(text).toContain('Tighten qualification.');
    expect(text).toContain('backed by 12 real');
  });
});
