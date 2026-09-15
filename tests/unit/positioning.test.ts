import { describe, it, expect } from 'vitest';
import { renderPositioningStatement } from '@/lib/positioning/positioning';

describe('renderPositioningStatement', () => {
  it('renders a real deterministic template from the given fields (positive case)', () => {
    const text = renderPositioningStatement({
      forWho: 'regulated enterprises', whoNeed: 'to adopt AI without compliance risk',
      categoryName: 'B2B AI & digital-marketing consultancy', keyBenefit: 'turns real data into a real growth plan',
      unlikeAlternative: 'generic AI agencies', differentiator: 'ship real, live-verified working software, not slide decks',
    });
    expect(text).toBe('For regulated enterprises who to adopt AI without compliance risk, TalentsHill is a B2B AI & digital-marketing consultancy that turns real data into a real growth plan. Unlike generic AI agencies, we ship real, live-verified working software, not slide decks.');
  });
});
