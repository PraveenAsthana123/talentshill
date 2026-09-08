import { db, schema } from './index';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { contentOverrides } = schema;

export function getOverrides(pageSlug: string) {
  return db.select().from(contentOverrides)
    .where(and(eq(contentOverrides.pageSlug, pageSlug), eq(contentOverrides.isActive, true)))
    .all();
}

export function getAllOverrides() {
  return db.select().from(contentOverrides).all();
}

export function upsertOverride(data: {
  pageSlug: string;
  section: string;
  key: string;
  value: unknown;
  updatedBy?: string;
}) {
  const existing = db.select().from(contentOverrides)
    .where(and(
      eq(contentOverrides.pageSlug, data.pageSlug),
      eq(contentOverrides.section, data.section),
      eq(contentOverrides.key, data.key),
    )).get();

  if (existing) {
    db.update(contentOverrides).set({
      value: JSON.stringify(data.value),
      updatedBy: data.updatedBy ?? null,
      updatedAt: new Date(),
    }).where(eq(contentOverrides.id, existing.id)).run();
    return existing.id;
  }

  const id = randomUUID();
  db.insert(contentOverrides).values({
    id,
    pageSlug: data.pageSlug,
    section: data.section,
    key: data.key,
    value: JSON.stringify(data.value),
    isActive: true,
    updatedBy: data.updatedBy ?? null,
    updatedAt: new Date(),
  }).run();
  return id;
}

export function deleteOverride(id: string) {
  db.delete(contentOverrides).where(eq(contentOverrides.id, id)).run();
}

export function toggleOverride(id: string, isActive: boolean) {
  db.update(contentOverrides).set({ isActive, updatedAt: new Date() })
    .where(eq(contentOverrides.id, id)).run();
}
