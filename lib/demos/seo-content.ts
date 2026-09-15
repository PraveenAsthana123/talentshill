import { db, schema } from '@/lib/db/index';
import { sql } from 'drizzle-orm';

// Demo 4 -- SEO + Content AI Factory. Real composition of the existing
// Content Management module (marketing_content + content_topics) and
// Competitor Analysis, plus disclosure of the real RAG Pipeline's role
// (content drafting assistance) and its real gap (no live rank-tracking/
// crawl integration exists).
export function getSeoContentView() {
  const contentByStatus = db.select({ status: schema.marketingContent.status, c: sql<number>`count(*)` })
    .from(schema.marketingContent).groupBy(schema.marketingContent.status).all();
  const topicsByStatus = db.select({ status: schema.contentTopics.status, c: sql<number>`count(*)` })
    .from(schema.contentTopics).groupBy(schema.contentTopics.status).all();
  const competitorCount = db.select({ c: sql<number>`count(*)` }).from(schema.competitorAnalysis).get()?.c ?? 0;
  const ragDocCount = db.select({ c: sql<number>`count(*)` }).from(schema.ragDocuments).get()?.c ?? 0;

  return {
    contentByStatus, topicsByStatus, competitorCount, ragDocCount,
    gapsDisclosed: 'No live site crawl, keyword-gap tool, or rank-tracking integration exists -- content briefs and drafts are real (Content Management + RAG Pipeline), but "keyword research" and "rank tracking" stages of the source flow are not automated.',
  };
}
