import { randomUUID } from 'crypto';
import { eq, count, desc, and } from 'drizzle-orm';
import { db, schema } from './index';

const { contentAssets } = schema;

export function createAsset(data: {
  title: string;
  assetType: string;
  description?: string;
  contentId?: string;
  slides?: unknown[];
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(contentAssets)
    .values({
      id,
      title: data.title,
      assetType: data.assetType,
      description: data.description,
      contentId: data.contentId,
      slides: data.slides ? JSON.stringify(data.slides) : '[]',
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

export function getAssetById(id: string) {
  return db.select().from(contentAssets).where(eq(contentAssets.id, id)).get();
}

export function getAssets(
  offset = 0,
  limit = 50,
  filters?: { assetType?: string; status?: string }
) {
  const conditions = [];
  if (filters?.assetType) conditions.push(eq(contentAssets.assetType, filters.assetType));
  if (filters?.status) conditions.push(eq(contentAssets.status, filters.status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(contentAssets)
    .where(where)
    .orderBy(desc(contentAssets.updatedAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export function getAssetCount(filters?: { assetType?: string; status?: string }) {
  const conditions = [];
  if (filters?.assetType) conditions.push(eq(contentAssets.assetType, filters.assetType));
  if (filters?.status) conditions.push(eq(contentAssets.status, filters.status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const result = db.select({ cnt: count() }).from(contentAssets).where(where).get();
  return result?.cnt ?? 0;
}

export function updateAsset(id: string, data: Partial<{
  title: string;
  description: string;
  coverImage: string;
  metadata: Record<string, unknown>;
}>) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.coverImage !== undefined) updates.coverImage = data.coverImage;
  if (data.metadata !== undefined) updates.metadata = JSON.stringify(data.metadata);
  db.update(contentAssets).set(updates).where(eq(contentAssets.id, id)).run();
}

export function updateAssetSlides(id: string, slides: unknown[]) {
  db.update(contentAssets)
    .set({ slides: JSON.stringify(slides), updatedAt: new Date() })
    .where(eq(contentAssets.id, id))
    .run();
}

export function updateAssetStatus(id: string, status: string) {
  db.update(contentAssets)
    .set({ status, updatedAt: new Date() })
    .where(eq(contentAssets.id, id))
    .run();
}

export function deleteAsset(id: string) {
  db.delete(contentAssets).where(eq(contentAssets.id, id)).run();
}
