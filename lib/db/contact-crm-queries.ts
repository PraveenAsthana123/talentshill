import { randomUUID } from 'crypto';
import { eq, desc, and, like, sql, inArray } from 'drizzle-orm';
import { db, schema } from './index';

const { contacts, contactEvents } = schema;

// ── Create contact ──
export function createContact(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  leadScore?: number;
  status?: string;
}) {
  const now = new Date();
  const id = randomUUID();
  db.insert(contacts)
    .values({
      id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      phone: data.phone,
      source: data.source ?? 'manual',
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      customFields: data.customFields ? JSON.stringify(data.customFields) : undefined,
      leadScore: data.leadScore ?? 0,
      status: data.status ?? 'active',
      subscribedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();
  return id;
}

// ── Get contact by ID ──
export function getContactById(id: string) {
  return db.select().from(contacts).where(eq(contacts.id, id)).get();
}

// ── Get contact by email ──
export function getContactByEmail(email: string) {
  return db.select().from(contacts).where(eq(contacts.email, email)).get();
}

// ── List contacts ──
export function getContacts(options: {
  search?: string;
  status?: string;
  source?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { search, status, source, limit = 50, offset = 0 } = options;
  const conditions = [];

  if (search) {
    conditions.push(
      sql`(${contacts.email} LIKE ${'%' + search + '%'} OR ${contacts.firstName} LIKE ${'%' + search + '%'} OR ${contacts.lastName} LIKE ${'%' + search + '%'} OR ${contacts.company} LIKE ${'%' + search + '%'})`
    );
  }
  if (status) conditions.push(eq(contacts.status, status));
  if (source) conditions.push(eq(contacts.source, source));

  return db
    .select()
    .from(contacts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(contacts.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
}

// ── Count contacts ──
export function getContactCount(options: { status?: string; source?: string } = {}) {
  const conditions = [];
  if (options.status) conditions.push(eq(contacts.status, options.status));
  if (options.source) conditions.push(eq(contacts.source, options.source));

  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(contacts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .get();
  return result?.count ?? 0;
}

// ── Update contact ──
export function updateContact(id: string, data: {
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  leadScore?: number;
  status?: string;
}) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.company !== undefined) updateData.company = data.company;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
  if (data.customFields !== undefined) updateData.customFields = JSON.stringify(data.customFields);
  if (data.leadScore !== undefined) updateData.leadScore = data.leadScore;
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === 'unsubscribed') updateData.unsubscribedAt = new Date();
  }

  db.update(contacts).set(updateData).where(eq(contacts.id, id)).run();
}

// ── Delete contact ──
export function deleteContact(id: string) {
  db.delete(contacts).where(eq(contacts.id, id)).run();
}

// ── Bulk delete ──
export function bulkDeleteContacts(ids: string[]) {
  if (ids.length === 0) return;
  db.delete(contacts).where(inArray(contacts.id, ids)).run();
}

// ── Bulk update tags ──
export function bulkUpdateTags(ids: string[], tags: string[]) {
  if (ids.length === 0) return;
  db.update(contacts)
    .set({ tags: JSON.stringify(tags), updatedAt: new Date() })
    .where(inArray(contacts.id, ids))
    .run();
}

// ── Add contact event ──
export function addContactEvent(contactId: string, eventType: string, metadata?: Record<string, unknown>) {
  db.insert(contactEvents)
    .values({
      id: randomUUID(),
      contactId,
      eventType,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      createdAt: new Date(),
    })
    .run();
}

// ── Get contact events ──
export function getContactEvents(contactId: string) {
  return db
    .select()
    .from(contactEvents)
    .where(eq(contactEvents.contactId, contactId))
    .orderBy(desc(contactEvents.createdAt))
    .all();
}

// ── Upsert contact (for sync from forms) ──
export function upsertContact(email: string, data: {
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  source?: string;
  tags?: string[];
}) {
  const existing = getContactByEmail(email);
  if (existing) {
    updateContact(existing.id, data);
    return existing.id;
  }
  return createContact({ email, ...data });
}
