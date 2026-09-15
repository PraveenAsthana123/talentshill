import { describe, it, expect } from 'vitest';
import { classifyLifecycle } from '@/lib/lifecycle/lifecycle-churn';

describe('classifyLifecycle', () => {
  it('returns unknown with no qualification stage or activity data (negative case)', () => {
    expect(classifyLifecycle(null, null)).toEqual({ stage: 'unknown', churnRisk: 'unknown' });
  });

  it('classifies unqualified as new regardless of recency (positive case)', () => {
    expect(classifyLifecycle('unqualified', 5)).toEqual({ stage: 'new', churnRisk: 'unknown' });
  });

  it('classifies mql/sql/opportunity as engaged (positive case)', () => {
    expect(classifyLifecycle('sql', 10).stage).toBe('engaged');
    expect(classifyLifecycle('opportunity', 10).stage).toBe('engaged');
  });

  it('classifies a recently-active customer as low churn risk (positive case)', () => {
    expect(classifyLifecycle('customer', 10)).toEqual({ stage: 'active_customer', churnRisk: 'low' });
  });

  it('classifies a customer inactive 31-90 days as medium risk (boundary case)', () => {
    expect(classifyLifecycle('customer', 31)).toEqual({ stage: 'active_customer', churnRisk: 'medium' });
    expect(classifyLifecycle('customer', 90)).toEqual({ stage: 'active_customer', churnRisk: 'medium' });
  });

  it('classifies a customer inactive 91-180 days as at_risk/high (boundary case)', () => {
    expect(classifyLifecycle('customer', 91)).toEqual({ stage: 'at_risk', churnRisk: 'high' });
    expect(classifyLifecycle('customer', 180)).toEqual({ stage: 'at_risk', churnRisk: 'high' });
  });

  it('classifies a customer inactive over 180 days as churned (negative/terminal case)', () => {
    expect(classifyLifecycle('customer', 181)).toEqual({ stage: 'churned', churnRisk: 'high' });
  });
});
