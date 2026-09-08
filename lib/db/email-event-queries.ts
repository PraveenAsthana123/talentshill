import { randomUUID } from 'crypto';
import { eq, desc, and, sql } from 'drizzle-orm';
import { db, schema } from './index';

const { emailEvents } = schema;

export function logEmailEvent(data: {
  emailMessageId?: string;
  recipientId?: string;
  contactId: string;
  campaignId?: string;
  eventType: string;
  linkUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  const id = randomUUID();
  db.insert(emailEvents).values({
    id,
    emailMessageId: data.emailMessageId ?? null,
    recipientId: data.recipientId ?? null,
    contactId: data.contactId,
    campaignId: data.campaignId ?? null,
    eventType: data.eventType,
    linkUrl: data.linkUrl ?? null,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    createdAt: new Date(),
  }).run();
  return id;
}

export function getEventsByContact(contactId: string, options: {
  limit?: number;
  offset?: number;
} = {}) {
  const { limit = 50, offset = 0 } = options;
  return db.select().from(emailEvents)
    .where(eq(emailEvents.contactId, contactId))
    .orderBy(desc(emailEvents.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export function getEventsByCampaign(campaignId: string, options: {
  eventType?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { eventType, limit = 100, offset = 0 } = options;
  const conditions = [eq(emailEvents.campaignId, campaignId)];
  if (eventType) conditions.push(eq(emailEvents.eventType, eventType));

  return db.select().from(emailEvents)
    .where(and(...conditions))
    .orderBy(desc(emailEvents.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export function getEventStats(campaignId: string) {
  const result = db.select({
    eventType: emailEvents.eventType,
    count: sql<number>`count(*)`,
  }).from(emailEvents)
    .where(eq(emailEvents.campaignId, campaignId))
    .groupBy(emailEvents.eventType)
    .all();

  const stats: Record<string, number> = {};
  for (const row of result) {
    stats[row.eventType] = row.count;
  }
  return stats;
}

export function getEventTimeline(campaignId: string, options: {
  limit?: number;
  offset?: number;
} = {}) {
  const { limit = 100, offset = 0 } = options;
  return db.select().from(emailEvents)
    .where(eq(emailEvents.campaignId, campaignId))
    .orderBy(desc(emailEvents.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export function getEventCount(campaignId: string) {
  const result = db.select({ count: sql<number>`count(*)` })
    .from(emailEvents)
    .where(eq(emailEvents.campaignId, campaignId))
    .get();
  return result?.count ?? 0;
}
