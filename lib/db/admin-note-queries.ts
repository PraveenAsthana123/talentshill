import { db, schema } from './index';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { adminNotes } = schema;

export function addNote(data: {
  entityType: string;
  entityId: string;
  content: string;
  createdBy?: string;
}) {
  const id = randomUUID();
  db.insert(adminNotes).values({
    id,
    entityType: data.entityType,
    entityId: data.entityId,
    content: data.content,
    createdBy: data.createdBy ?? null,
    createdAt: new Date(),
  }).run();
  return id;
}

export function getNotes(entityType: string, entityId: string) {
  return db.select().from(adminNotes).where(and(eq(adminNotes.entityType, entityType), eq(adminNotes.entityId, entityId))).orderBy(desc(adminNotes.createdAt)).all();
}

export function deleteNote(id: string) {
  db.delete(adminNotes).where(eq(adminNotes.id, id)).run();
}
