import { db, schema } from './index';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { contentPersonas } = schema;

export function createPersona(data: { name: string; description: string; toneNotes?: string; createdBy?: string }) {
  const id = randomUUID();
  const now = new Date();
  db.insert(contentPersonas).values({
    id, name: data.name, description: data.description, toneNotes: data.toneNotes,
    createdBy: data.createdBy, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getPersonaById(id: string) {
  return db.select().from(contentPersonas).where(eq(contentPersonas.id, id)).get();
}

export function getAllPersonas() {
  return db.select().from(contentPersonas).orderBy(desc(contentPersonas.createdAt)).all();
}

export function deletePersona(id: string) {
  db.delete(contentPersonas).where(eq(contentPersonas.id, id)).run();
}
