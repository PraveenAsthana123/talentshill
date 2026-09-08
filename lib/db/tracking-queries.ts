import { db, schema } from './index';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { emailMessages, unsubscribeTokens, campaignRecipients, contacts, contactEvents, emailEvents } = schema;

export function createEmailMessage(data: {
  recipientId?: string;
  contactId: string;
  campaignId?: string;
  profileId?: string;
  subject: string;
  messageId?: string;
  metadata?: Record<string, unknown>;
}) {
  const id = randomUUID();
  db.insert(emailMessages).values({
    id,
    recipientId: data.recipientId ?? null,
    contactId: data.contactId,
    campaignId: data.campaignId ?? null,
    profileId: data.profileId ?? null,
    subject: data.subject,
    status: 'queued',
    messageId: data.messageId ?? null,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    createdAt: new Date(),
  }).run();
  return id;
}

export function updateMessageStatus(id: string, status: string, messageId?: string) {
  const updates: Record<string, unknown> = { status };
  if (status === 'sent') updates.sentAt = new Date();
  if (messageId) updates.messageId = messageId;
  db.update(emailMessages).set(updates).where(eq(emailMessages.id, id)).run();
}

export function getMessageById(id: string) {
  return db.select().from(emailMessages).where(eq(emailMessages.id, id)).get();
}

export function getMessageByRecipientId(recipientId: string) {
  return db.select().from(emailMessages).where(eq(emailMessages.recipientId, recipientId)).get();
}

export function createUnsubscribeToken(contactId: string, campaignId?: string) {
  const id = randomUUID();
  const token = randomUUID();
  db.insert(unsubscribeTokens).values({
    id,
    contactId,
    token,
    campaignId: campaignId ?? null,
    isUsed: false,
    createdAt: new Date(),
  }).run();
  return token;
}

export function validateUnsubscribeToken(token: string) {
  return db.select().from(unsubscribeTokens)
    .where(and(eq(unsubscribeTokens.token, token), eq(unsubscribeTokens.isUsed, false)))
    .get();
}

export function markUnsubscribed(token: string) {
  // Mark token as used
  db.update(unsubscribeTokens).set({
    isUsed: true,
    usedAt: new Date(),
  }).where(eq(unsubscribeTokens.token, token)).run();

  // Get the token record to find contactId
  const tokenRecord = db.select().from(unsubscribeTokens)
    .where(eq(unsubscribeTokens.token, token)).get();

  if (tokenRecord) {
    // Update contact status
    db.update(contacts).set({
      status: 'unsubscribed',
      unsubscribedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(contacts.id, tokenRecord.contactId)).run();

    // Log contact event
    db.insert(contactEvents).values({
      id: randomUUID(),
      contactId: tokenRecord.contactId,
      eventType: 'unsubscribed',
      metadata: JSON.stringify({ campaignId: tokenRecord.campaignId, token }),
      createdAt: new Date(),
    }).run();

    // Log email event
    db.insert(emailEvents).values({
      id: randomUUID(),
      contactId: tokenRecord.contactId,
      campaignId: tokenRecord.campaignId ?? null,
      eventType: 'unsubscribed',
      createdAt: new Date(),
    }).run();

    // If campaign recipient exists, update status
    if (tokenRecord.campaignId) {
      db.update(campaignRecipients).set({
        status: 'unsubscribed',
      }).where(
        and(
          eq(campaignRecipients.campaignId, tokenRecord.campaignId),
          eq(campaignRecipients.contactId, tokenRecord.contactId)
        )
      ).run();
    }
  }
}

export function logOpenEvent(recipientId: string) {
  const now = new Date();

  // Update campaign recipient
  db.update(campaignRecipients).set({
    status: 'opened',
    openedAt: now,
  }).where(eq(campaignRecipients.id, recipientId)).run();

  // Get recipient to find contactId and campaignId
  const recipient = db.select().from(campaignRecipients)
    .where(eq(campaignRecipients.id, recipientId)).get();

  if (recipient) {
    // Log contact event
    db.insert(contactEvents).values({
      id: randomUUID(),
      contactId: recipient.contactId,
      eventType: 'email_opened',
      metadata: JSON.stringify({ campaignId: recipient.campaignId, recipientId }),
      createdAt: now,
    }).run();

    // Log email event
    db.insert(emailEvents).values({
      id: randomUUID(),
      recipientId,
      contactId: recipient.contactId,
      campaignId: recipient.campaignId,
      eventType: 'opened',
      createdAt: now,
    }).run();
  }
}

export function logClickEvent(recipientId: string, url: string) {
  const now = new Date();

  // Update campaign recipient
  db.update(campaignRecipients).set({
    status: 'clicked',
    clickedAt: now,
  }).where(eq(campaignRecipients.id, recipientId)).run();

  // Get recipient to find contactId
  const recipient = db.select().from(campaignRecipients)
    .where(eq(campaignRecipients.id, recipientId)).get();

  if (recipient) {
    // Log contact event
    db.insert(contactEvents).values({
      id: randomUUID(),
      contactId: recipient.contactId,
      eventType: 'email_clicked',
      metadata: JSON.stringify({ campaignId: recipient.campaignId, recipientId, url }),
      createdAt: now,
    }).run();

    // Log email event
    db.insert(emailEvents).values({
      id: randomUUID(),
      recipientId,
      contactId: recipient.contactId,
      campaignId: recipient.campaignId,
      eventType: 'clicked',
      linkUrl: url,
      createdAt: now,
    }).run();
  }
}
