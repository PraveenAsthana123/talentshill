import { describe, it, expect } from 'vitest';
import { rollupAccounts } from '@/lib/abm/account-rollup';

describe('rollupAccounts', () => {
  it('groups case/whitespace-varied company names into one real account (positive case)', () => {
    const rollups = rollupAccounts([
      { company: 'Acme Corp', fullName: 'A', email: 'a@acme.com', role: 'CTO', leadScore: 80, leadTier: 'hot' },
      { company: 'acme corp ', fullName: 'B', email: 'b@acme.com', role: 'VP Eng', leadScore: 60, leadTier: 'warm' },
    ]);
    expect(rollups.length).toBe(1);
    expect(rollups[0].memberCount).toBe(2);
    expect(rollups[0].companyName).toBe('Acme Corp'); // first real casing kept, not canonicalized
  });

  it('excludes submissions with no real company name (negative case)', () => {
    const rollups = rollupAccounts([{ company: '', fullName: 'X', email: 'x@x.com', role: null, leadScore: null, leadTier: null }]);
    expect(rollups.length).toBe(0);
  });

  it('accountScore is the real max leadScore among members (positive case)', () => {
    const rollups = rollupAccounts([
      { company: 'Beta Inc', fullName: 'A', email: 'a@beta.com', role: null, leadScore: 40, leadTier: 'cool' },
      { company: 'Beta Inc', fullName: 'B', email: 'b@beta.com', role: null, leadScore: 90, leadTier: 'hot' },
    ]);
    expect(rollups[0].accountScore).toBe(90);
  });

  it('a single-contact company is still a real account (boundary case)', () => {
    const rollups = rollupAccounts([{ company: 'Solo LLC', fullName: 'A', email: 'a@solo.com', role: null, leadScore: 50, leadTier: 'warm' }]);
    expect(rollups.length).toBe(1);
    expect(rollups[0].memberCount).toBe(1);
  });

  it('sorts accounts by real accountScore descending (consistency)', () => {
    const rollups = rollupAccounts([
      { company: 'Low Co', fullName: 'A', email: 'a@low.com', role: null, leadScore: 10, leadTier: 'cold' },
      { company: 'High Co', fullName: 'B', email: 'b@high.com', role: null, leadScore: 95, leadTier: 'hot' },
    ]);
    expect(rollups[0].companyName).toBe('High Co');
  });
});
