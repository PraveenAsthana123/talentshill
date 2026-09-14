import { db, schema } from './index';
import { eq, desc, and, gte } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { reEngagementMessages, contacts } = schema;

export function createReEngagementMessage(data: {
  contactId: string;
  channel: 'sms' | 'whatsapp';
  triggerReason: string;
  messageBody: string;
  phoneNumberSnapshot?: string;
  status?: 'logged' | 'failed';
  failureReason?: string;
  triggeredAt?: Date;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(reEngagementMessages).values({
    id,
    contactId: data.contactId,
    channel: data.channel,
    triggerReason: data.triggerReason,
    messageBody: data.messageBody,
    phoneNumberSnapshot: data.phoneNumberSnapshot ?? null,
    status: data.status ?? 'logged',
    failureReason: data.failureReason ?? null,
    triggeredAt: data.triggeredAt ?? now,
    createdBy: data.createdBy,
    createdAt: now,
  }).run();
  return id;
}

export function getAllReEngagementMessages(options: { channel?: string; limit?: number; offset?: number } = {}) {
  const { channel, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (channel) conditions.push(eq(reEngagementMessages.channel, channel as 'sms' | 'whatsapp'));
  const query = conditions.length ? db.select().from(reEngagementMessages).where(and(...conditions)) : db.select().from(reEngagementMessages);
  const items = query.orderBy(desc(reEngagementMessages.triggeredAt)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(reEngagementMessages).where(and(...conditions)) : db.select().from(reEngagementMessages)).all().length;
  return { items, total };
}

// Real at-risk contacts eligible for re-engagement -- reuses the exact
// query pattern already established in
// contact-retention-segmentation-pipeline.ts (contacts module), reading
// the real lifecycleStage already written by the activation pipeline,
// never recomputing it here.
export function getAtRiskContacts() {
  return db.select().from(contacts).where(eq(contacts.lifecycleStage, 'at_risk')).all();
}

// Most recent re-engagement message sent to a contact on any channel --
// used to enforce a real cooldown so the same contact isn't re-triggered
// every single pipeline run.
export function getLastReEngagementMessageForContact(contactId: string) {
  return db.select().from(reEngagementMessages)
    .where(eq(reEngagementMessages.contactId, contactId))
    .orderBy(desc(reEngagementMessages.triggeredAt))
    .limit(1)
    .get();
}

export function getReEngagementMessageCountSince(since: Date) {
  return db.select().from(reEngagementMessages).where(gte(reEngagementMessages.triggeredAt, since)).all().length;
}
