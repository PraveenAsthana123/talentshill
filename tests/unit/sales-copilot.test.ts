import { describe, it, expect } from 'vitest';
import { formatTalkingPoints } from '@/lib/presales/sales-copilot';

describe('formatTalkingPoints', () => {
  it('returns an empty array with no real inputs (negative case)', () => {
    expect(formatTalkingPoints([], null)).toEqual([]);
  });

  it('includes a real KPI highlight per dimension (positive case)', () => {
    const points = formatTalkingPoints([{ dimension: 'operational_health', value: 95.9, unit: 'percent' }], null);
    expect(points.length).toBe(1);
    expect(points[0].text).toContain('95.9%');
  });

  it('surfaces the leading gap but also honestly discloses a trailing gap (positive case)', () => {
    const points = formatTalkingPoints([], [
      { dimension: 'digital_presence', gap: -18 },
      { dimension: 'delivery_speed', gap: 12 },
    ]);
    const texts = points.map((p) => p.text).join(' ');
    expect(texts).toContain('leads on delivery speed');
    expect(texts).toContain('gap on digital presence');
  });
});
