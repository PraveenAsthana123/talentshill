import { describe, it, expect } from 'vitest';
import { defineVertical, getVerticalPacks } from '@/lib/vertical/vertical-pack';

describe('defineVertical', () => {
  it('rejects an empty realKpiDimensions array (negative case)', () => {
    expect(() => defineVertical({ verticalKey: '__e2e_test_vertical', verticalName: 'x', description: 'x', realKpiDimensions: [], confirmedBy: 'test' })).toThrow(/realKpiDimensions/);
  });

  it('persists a real vertical and re-confirming updates rather than duplicates (positive case)', () => {
    defineVertical({ verticalKey: '__e2e_test_vertical', verticalName: 'Test Vertical', description: 'd1', realKpiDimensions: ['lead_generation'], confirmedBy: 'test' });
    defineVertical({ verticalKey: '__e2e_test_vertical', verticalName: 'Test Vertical Updated', description: 'd2', realKpiDimensions: ['lead_generation', 'lead_quality'], confirmedBy: 'test' });
    const packs = getVerticalPacks().filter((p) => p.verticalKey === '__e2e_test_vertical');
    expect(packs.length).toBe(1);
    expect(packs[0].verticalName).toBe('Test Vertical Updated');
    expect(packs[0].realKpiDimensions).toEqual(['lead_generation', 'lead_quality']);
  });
});
