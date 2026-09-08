import { randomUUID } from 'crypto';
import { eq, desc, and, like, sql } from 'drizzle-orm';
import { db, schema } from './index';

const { media } = schema;

export function createMedia(data: {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  alt?: string;
  tags?: string[];
  folder?: string;
  uploadedBy?: string;
}) {
  const id = randomUUID();
  db.insert(media)
    .values({
      id,
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      path: data.path,
      url: data.url,
      alt: data.alt,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      folder: data.folder,
      uploadedBy: data.uploadedBy,
      isActive: true,
      createdAt: new Date(),
    })
    .run();
  return id;
}

export function getMediaList(options: {
  folder?: string;
  mimeType?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { folder, mimeType, search, limit = 50, offset = 0 } = options;
  const conditions = [];

  if (folder) conditions.push(eq(media.folder, folder));
  if (mimeType) conditions.push(like(media.mimeType, `${mimeType}%`));
  if (search) conditions.push(like(media.originalName, `%${search}%`));
  conditions.push(eq(media.isActive, true));

  return db
    .select()
    .from(media)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(media.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export function getMediaCount(options: { folder?: string } = {}) {
  const conditions = [eq(media.isActive, true)];
  if (options.folder) conditions.push(eq(media.folder, options.folder));

  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(media)
    .where(and(...conditions))
    .get();
  return result?.count ?? 0;
}

export function getMediaById(id: string) {
  return db.select().from(media).where(eq(media.id, id)).get();
}

export function updateMedia(id: string, data: {
  alt?: string;
  tags?: string[];
  folder?: string;
}) {
  db.update(media)
    .set({
      alt: data.alt,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      folder: data.folder,
    })
    .where(eq(media.id, id))
    .run();
}

export function deleteMedia(id: string) {
  db.update(media).set({ isActive: false }).where(eq(media.id, id)).run();
}

export function getMediaByFolder(folder: string) {
  return db
    .select()
    .from(media)
    .where(and(eq(media.folder, folder), eq(media.isActive, true)))
    .orderBy(desc(media.createdAt))
    .all();
}
