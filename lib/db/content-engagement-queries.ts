import { db, schema } from './index';
import { eq, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { contentEngagementMetrics, marketingContent, contentTopics } = schema;

export function createEngagementEntry(data: {
  contentId: string;
  recordedDate: Date;
  views?: number;
  leadsGenerated?: number;
  enteredBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(contentEngagementMetrics).values({
    id, contentId: data.contentId, recordedDate: data.recordedDate,
    views: data.views ?? 0, leadsGenerated: data.leadsGenerated ?? 0,
    enteredBy: data.enteredBy, createdAt: now,
  }).run();
  return id;
}

export function getEngagementForContent(contentId: string) {
  return db.select().from(contentEngagementMetrics)
    .where(eq(contentEngagementMetrics.contentId, contentId))
    .orderBy(desc(contentEngagementMetrics.recordedDate))
    .all();
}

export interface ContentPerformanceAggregate {
  contentId: string;
  title: string;
  contentType: string;
  status: string;
  topicId: string | null;
  personaId: string | null;
  totalViews: number;
  totalLeads: number;
  conversionRate: number | null; // leads / views
  entryCount: number;
}

// Real SQL aggregation. Content with zero logged engagement entries
// returns conversionRate:null, never a fabricated ratio.
export function getPerformanceAggregateForAllContent(): ContentPerformanceAggregate[] {
  const rows = db.select({
    contentId: marketingContent.id,
    title: marketingContent.title,
    contentType: marketingContent.contentType,
    status: marketingContent.status,
    topicId: contentTopics.id,
    personaId: contentTopics.personaId,
    totalViews: sql<number>`COALESCE(SUM(${contentEngagementMetrics.views}), 0)`,
    totalLeads: sql<number>`COALESCE(SUM(${contentEngagementMetrics.leadsGenerated}), 0)`,
    entryCount: sql<number>`COUNT(${contentEngagementMetrics.id})`,
  })
    .from(marketingContent)
    .leftJoin(contentEngagementMetrics, eq(contentEngagementMetrics.contentId, marketingContent.id))
    .leftJoin(contentTopics, eq(contentTopics.generatedContentId, marketingContent.id))
    .groupBy(marketingContent.id)
    .all();

  return rows.map((r) => ({
    ...r,
    conversionRate: r.entryCount > 0 && r.totalViews > 0 ? r.totalLeads / r.totalViews : null,
  }));
}
