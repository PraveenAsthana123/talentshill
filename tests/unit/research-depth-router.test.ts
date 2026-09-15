import { describe, it, expect } from 'vitest';
import { computeResearchDepth } from '@/lib/agents/research-depth-router';

describe('computeResearchDepth', () => {
  it('returns deep for a hot lead (positive case)', () => {
    expect(computeResearchDepth('hot', null)).toBe('deep');
  });
  it('returns none for a cold lead, skipping the costed call (negative case)', () => {
    expect(computeResearchDepth('cold', '250k+')).toBe('none');
  });
  it('returns light for a warm lead with no budget known (boundary case)', () => {
    expect(computeResearchDepth('warm', null)).toBe('light');
  });
  it('returns deep for a warm lead with budget known (positive case)', () => {
    expect(computeResearchDepth('warm', '50k-100k')).toBe('deep');
  });
  it('returns light for a cool lead (positive case)', () => {
    expect(computeResearchDepth('cool', null)).toBe('light');
  });
});
