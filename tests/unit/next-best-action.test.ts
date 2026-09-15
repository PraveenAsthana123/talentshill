import { describe, it, expect } from 'vitest';
import { computeNextBestAction } from '@/lib/contact/next-best-action';

describe('computeNextBestAction', () => {
  it('recommends schedule_call for a hot lead (positive case)', () => {
    expect(computeNextBestAction('hot', '100k-250k').action).toBe('schedule_call');
  });

  it('recommends request_budget_info for a warm lead with no budget (negative case)', () => {
    expect(computeNextBestAction('warm', null).action).toBe('request_budget_info');
  });

  it('recommends send_pricing for a warm lead with budget known (positive case)', () => {
    expect(computeNextBestAction('warm', '50k-100k').action).toBe('send_pricing');
  });

  it('recommends nurture_email for a cool lead (positive case)', () => {
    expect(computeNextBestAction('cool', null).action).toBe('nurture_email');
  });

  it('recommends no_action_cold for a cold lead, even with budget provided (boundary case)', () => {
    expect(computeNextBestAction('cold', '250k+').action).toBe('no_action_cold');
  });
});
