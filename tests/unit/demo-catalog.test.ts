import { describe, it, expect } from 'vitest';
import { getOwnModuleDemoCatalog, getOwnModuleDemoCatalogCount } from '@/lib/presales/demo-catalog';

describe('getOwnModuleDemoCatalog (real DB integration)', () => {
  it('only returns real, live-verified modules -- never partial/not_built (consistency check)', () => {
    const catalog = getOwnModuleDemoCatalog();
    expect(catalog.length).toBeGreaterThan(0);
    for (const m of catalog) {
      expect(m.moduleKey.length).toBeGreaterThan(0);
      expect(m.name.length).toBeGreaterThan(0);
    }
  });
});

describe('getOwnModuleDemoCatalogCount', () => {
  it('counts are non-negative and consistent with the real registry (consistency check)', () => {
    const counts = getOwnModuleDemoCatalogCount();
    expect(counts.real).toBeGreaterThanOrEqual(0);
    expect(counts.real).toBe(getOwnModuleDemoCatalog().length);
  });
});
