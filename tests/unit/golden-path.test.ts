import { describe, it, expect } from 'vitest';
import { defineGoldenPath } from '@/lib/goldenpath/golden-path';

describe('defineGoldenPath', () => {
  it('rejects an evidenceDocPath that does not exist on disk (negative case)', () => {
    expect(() => defineGoldenPath({
      code: '__e2e_test_gp', title: 'x', description: 'x',
      evidenceDocPath: 'docs/testing/this-file-does-not-exist-anywhere.txt', verifiedBy: 'test',
    })).toThrow(/does not exist/);
  });

  it('accepts a real, existing evidenceDocPath (positive case)', () => {
    const id = defineGoldenPath({
      code: '__e2e_test_gp', title: 'Test path', description: 'x',
      evidenceDocPath: 'docs/testing/2026-09-14_evidence-ledger-log.txt', verifiedBy: 'test',
    });
    expect(id).toBeTruthy();
  });
});
