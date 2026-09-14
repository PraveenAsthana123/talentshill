import { db, schema } from './index';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { brandMentions } = schema;
type MentionSource = 'social' | 'review' | 'news' | 'survey';
type Sentiment = 'positive' | 'neutral' | 'negative';

export function createBrandMention(data: {
  source: MentionSource;
  sourceName?: string;
  excerpt: string;
  url?: string;
  collectedAt: Date;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(brandMentions).values({
    id, source: data.source, sourceName: data.sourceName, excerpt: data.excerpt,
    url: data.url, collectedAt: data.collectedAt, createdBy: data.createdBy, createdAt: now,
  }).run();
  return id;
}

export function getBrandMentionById(id: string) {
  return db.select().from(brandMentions).where(eq(brandMentions.id, id)).get();
}

export function getAllBrandMentions() {
  return db.select().from(brandMentions).orderBy(desc(brandMentions.collectedAt)).all();
}

export function updateBrandMentionSentiment(id: string, data: { sentiment: Sentiment; sentimentExplanation: string; topics?: string[] }) {
  db.update(brandMentions).set({
    sentiment: data.sentiment,
    sentimentExplanation: data.sentimentExplanation,
    topics: data.topics ? JSON.stringify(data.topics) : undefined,
  }).where(eq(brandMentions.id, id)).run();
}

export function deleteBrandMention(id: string) {
  db.delete(brandMentions).where(eq(brandMentions.id, id)).run();
}
