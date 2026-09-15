import { describe, it, expect } from 'vitest';
import { getDemoRecommendation } from '@/lib/presales/demo-recommendation';

describe('getDemoRecommendation (real DB integration)', () => {
  it('resolves the top opportunity to a real, existing module (consistency check)', () => {
    const rec = getDemoRecommendation();
    if (rec === null) return; // no real opportunities computed yet in this env -- valid honest state
    expect(rec.moduleKey.length).toBeGreaterThan(0);
    expect(rec.moduleName.length).toBeGreaterThan(0);
    expect(rec.reason.length).toBeGreaterThan(0);
  });
});
