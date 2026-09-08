import { randomUUID } from 'crypto';
import { eq, desc, sql } from 'drizzle-orm';
import { db, schema } from './index';

const { contentVersions } = schema;

export function createVersion(
  contentId: string,
  title: string,
  body: string,
  changedBy?: string,
  changeNote?: string
) {
  const id = randomUUID();
  const existing = db
    .select({ maxVer: sql<number>`COALESCE(MAX(${contentVersions.versionNumber}), 0)` })
    .from(contentVersions)
    .where(eq(contentVersions.contentId, contentId))
    .get();
  const versionNumber = (existing?.maxVer ?? 0) + 1;

  db.insert(contentVersions)
    .values({ id, contentId, versionNumber, title, body, changedBy, changeNote, createdAt: new Date() })
    .run();
  return { id, versionNumber };
}

export function getVersions(contentId: string) {
  return db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.contentId, contentId))
    .orderBy(desc(contentVersions.versionNumber))
    .all();
}

export function getVersionById(id: string) {
  return db.select().from(contentVersions).where(eq(contentVersions.id, id)).get();
}

export function getLatestVersionNumber(contentId: string): number {
  const result = db
    .select({ maxVer: sql<number>`COALESCE(MAX(${contentVersions.versionNumber}), 0)` })
    .from(contentVersions)
    .where(eq(contentVersions.contentId, contentId))
    .get();
  return result?.maxVer ?? 0;
}
