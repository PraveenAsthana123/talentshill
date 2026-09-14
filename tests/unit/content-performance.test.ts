import { describe, it, expect, afterAll } from 'vitest';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { createContent, deleteContent } from '@/lib/db/marketing-content-queries';
import { createEngagementEntry, getPerformanceAggregateForAllContent } from '@/lib/db/content-engagement-queries';
import { classifyContentAction } from '@/lib/pipelines/content-performance-pipeline';
import { containsSuspiciousStatistics } from '@/lib/agents/fabrication-guard';

describe('containsSuspiciousStatistics (fabrication-detection backstop)', () => {
  it('flags a fabricated percentage claim (regression: caught live 2026-09-14 -- phi4-mini invented stats despite being told not to)', () => {
    expect(containsSuspiciousStatistics('One customer saw a 15% increase in engagement.')).toBe(true);
  });
  it('flags a fabricated dollar figure', () => {
    expect(containsSuspiciousStatistics('Save $500 per month with this approach.')).toBe(true);
  });
  it('does not flag genuine qualitative content with no numbers (negative case)', () => {
    expect(containsSuspiciousStatistics('AI marketing can meaningfully improve engagement and reduce manual effort over time.')).toBe(false);
  });
});

const base = { contentId: 'c1', title: 'Test Article', contentType: 'article', totalViews: 1000, totalLeads: 0 };

describe('classifyContentAction (pure rule)', () => {
  it('recommends produce_more for the top-ranked content (positive case)', () => {
    const result = classifyContentAction({ ...base, conversionRate: 0.05, totalLeads: 50 }, 0, 4);
    expect(result.action).toBe('produce_more');
  });
  it('recommends deprioritize for a bottom-half content item (negative case)', () => {
    // 4 scored items, topHalfCutoff = floor(3/2) = 1 -> ranks 0,1 qualify; rank 3 does not
    const result = classifyContentAction({ ...base, conversionRate: 0.001, totalLeads: 1 }, 3, 4);
    expect(result.action).toBe('deprioritize');
  });
  it('recommends produce_more for a single high-performing item, not hold (boundary: n=1)', () => {
    const result = classifyContentAction({ ...base, conversionRate: 0.05, totalLeads: 50 }, 0, 1);
    expect(result.action).toBe('produce_more');
  });
  it('holds when conversionRate is null (no engagement data) (boundary)', () => {
    const result = classifyContentAction({ ...base, conversionRate: null }, 0, 1);
    expect(result.action).toBe('hold');
    expect(result.reason).toContain('No engagement data');
  });
});

const createdIds: string[] = [];
function makeContent(title: string) {
  const id = createContent({ title, contentType: 'article', body: 'x'.repeat(200) });
  createdIds.push(id);
  return id;
}

afterAll(() => {
  for (const id of createdIds) {
    db.delete(schema.contentEngagementMetrics).where(eq(schema.contentEngagementMetrics.contentId, id)).run();
    deleteContent(id);
  }
  for (const id of createdIds) {
    const remaining = db.select().from(schema.marketingContent).where(eq(schema.marketingContent.id, id)).get();
    expect(remaining).toBeUndefined();
  }
});

describe('content engagement aggregation (real DB)', () => {
  it('excludes content with zero engagement entries from scoring (boundary)', () => {
    const id = makeContent(`__test_no_engagement_${Date.now()}`);
    const aggregate = getPerformanceAggregateForAllContent().find((a) => a.contentId === id);
    expect(aggregate?.entryCount).toBe(0);
    expect(aggregate?.conversionRate).toBeNull();
  });

  it('computes conversion rate from real views/leads via SQL SUM (positive case)', () => {
    const id = makeContent(`__test_conversion_${Date.now()}`);
    createEngagementEntry({ contentId: id, recordedDate: new Date(), views: 1000, leadsGenerated: 25 });
    const aggregate = getPerformanceAggregateForAllContent().find((a) => a.contentId === id);
    expect(aggregate?.conversionRate).toBeCloseTo(0.025, 5);
  });
});
