import { randomUUID } from 'crypto';
import { eq, desc, and, sql, inArray } from 'drizzle-orm';
import { db, schema } from './index';

const { lists, listMembers, contacts } = schema;

// ── Create list ──
export function createList(data: {
  name: string;
  description?: string;
  type?: string;
  segmentRules?: Record<string, unknown>;
  createdBy?: string;
}) {
  const now = new Date();
  const id = randomUUID();
  db.insert(lists)
    .values({
      id,
      name: data.name,
      description: data.description,
      type: data.type ?? 'static',
      segmentRules: data.segmentRules ? JSON.stringify(data.segmentRules) : undefined,
      memberCount: 0,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

// ── Get all lists ──
export function getAllLists() {
  return db.select().from(lists).orderBy(desc(lists.createdAt)).all();
}

// ── Get list by ID ──
export function getListById(id: string) {
  return db.select().from(lists).where(eq(lists.id, id)).get();
}

// ── Update list ──
export function updateList(id: string, data: {
  name?: string;
  description?: string;
  segmentRules?: Record<string, unknown>;
}) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.segmentRules !== undefined) updateData.segmentRules = JSON.stringify(data.segmentRules);

  db.update(lists).set(updateData).where(eq(lists.id, id)).run();
}

// ── Delete list ──
export function deleteList(id: string) {
  db.delete(lists).where(eq(lists.id, id)).run();
}

// ── Add members to list ──
export function addListMembers(listId: string, contactIds: string[]) {
  if (contactIds.length === 0) return;
  const now = new Date();

  for (const contactId of contactIds) {
    db.insert(listMembers)
      .values({ listId, contactId, addedAt: now })
      .onConflictDoNothing()
      .run();
  }

  updateMemberCount(listId);
}

// ── Remove members from list ──
export function removeListMembers(listId: string, contactIds: string[]) {
  if (contactIds.length === 0) return;

  for (const contactId of contactIds) {
    db.delete(listMembers)
      .where(and(eq(listMembers.listId, listId), eq(listMembers.contactId, contactId)))
      .run();
  }

  updateMemberCount(listId);
}

// ── Get list members ──
export function getListMembers(listId: string, options: { limit?: number; offset?: number } = {}) {
  const { limit = 50, offset = 0 } = options;

  return db
    .select({
      contactId: listMembers.contactId,
      addedAt: listMembers.addedAt,
      email: contacts.email,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      company: contacts.company,
      status: contacts.status,
    })
    .from(listMembers)
    .innerJoin(contacts, eq(listMembers.contactId, contacts.id))
    .where(eq(listMembers.listId, listId))
    .orderBy(desc(listMembers.addedAt))
    .limit(limit)
    .offset(offset)
    .all();
}

// ── Update member count ──
function updateMemberCount(listId: string) {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(listMembers)
    .where(eq(listMembers.listId, listId))
    .get();

  db.update(lists)
    .set({ memberCount: result?.count ?? 0, updatedAt: new Date() })
    .where(eq(lists.id, listId))
    .run();
}

// ── Get list member count ──
export function getListMemberCount(listId: string) {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(listMembers)
    .where(eq(listMembers.listId, listId))
    .get();
  return result?.count ?? 0;
}

// ── Get list member contact IDs (no join, no pagination limit) ──
export function getListMemberIds(listId: string): string[] {
  return db.select({ contactId: listMembers.contactId }).from(listMembers).where(eq(listMembers.listId, listId)).all().map(r => r.contactId);
}
