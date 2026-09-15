import { describe, it, expect } from 'vitest';
import { canPublish, createCaseStudy, publishCaseStudy } from '@/lib/casestudy/case-study';

describe('canPublish', () => {
  it('rejects a null evidenceId (negative case)', () => expect(canPublish(null)).toBe(false));
  it('rejects an empty-string evidenceId (negative case)', () => expect(canPublish('')).toBe(false));
  it('accepts a non-empty evidenceId (positive case)', () => expect(canPublish('some-real-id')).toBe(true));
});

describe('publishCaseStudy (real DB integration)', () => {
  it('refuses to publish a case study with no evidenceId (negative case)', () => {
    const id = createCaseStudy({ title: '__e2e_test', clientContext: 'x', challenge: 'x', solutionText: 'x', outcome: 'x' });
    const result = publishCaseStudy(id);
    expect(result.published).toBe(false);
    expect(result.reason).toMatch(/evidenceId/);
  });

  it('the real foreign-key constraint rejects a fabricated evidenceId at creation time -- an even stronger guarantee than the app-level check (negative case)', () => {
    expect(() => createCaseStudy({ title: '__e2e_test', clientContext: 'x', challenge: 'x', solutionText: 'x', outcome: 'x', evidenceId: 'nonexistent-fabricated-id' })).toThrow(/FOREIGN KEY/);
  });
});
