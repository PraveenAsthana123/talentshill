import { describe, it, expect } from 'vitest';
import { recordEvidence, listEvidence, getEvidenceSummary, isSourceRefValid } from '@/lib/evidence/evidence-ledger';

describe('recordEvidence (mandatory source traceability)', () => {
  it('rejects an empty sourceRef (negative case)', () => {
    expect(() => recordEvidence({
      moduleKey: 'leads', claimClass: 'fact', claimText: 'x', sourceRef: '',
    })).toThrow(/sourceRef/);
  });

  it('rejects empty claimText (negative case)', () => {
    expect(() => recordEvidence({
      moduleKey: 'leads', claimClass: 'fact', claimText: '', sourceRef: 'contact_submissions:abc',
    })).toThrow(/claimText/);
  });

  it('records a real evidence row and it is listable (positive case)', () => {
    const id = recordEvidence({
      moduleKey: '__e2e_test_evidence', claimClass: 'fact', claimText: 'Test claim', sourceRef: 'contact_submissions:test-1',
    });
    expect(id).toBeTruthy();
    const rows = listEvidence({ moduleKey: '__e2e_test_evidence' });
    expect(rows.some((r) => r.id === id)).toBe(true);
  });
});

describe('getEvidenceSummary (real, never fabricated)', () => {
  it('returns zero counts for a module with no evidence (negative case)', () => {
    const summary = getEvidenceSummary('__e2e_test_nonexistent_module_xyz');
    expect(summary.total).toBe(0);
    expect(summary.totalByClass).toEqual({});
    expect(summary.staleCount).toBe(0);
  });
});

describe('isSourceRefValid', () => {
  it('accepts a well-formed "table:id" ref (positive case)', () => {
    expect(isSourceRefValid('contact_submissions:abc-123')).toBe(true);
  });
  it('rejects a ref with no colon (negative case)', () => {
    expect(isSourceRefValid('contact_submissions')).toBe(false);
  });
  it('rejects an empty ref (boundary)', () => {
    expect(isSourceRefValid('')).toBe(false);
  });
});
