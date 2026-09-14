import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { brandAssets } = schema;

export function createBrandAsset(data: {
  name: string;
  category: 'logo' | 'color_palette' | 'typography' | 'guideline_doc' | 'template' | 'other';
  filePath?: string;
  description?: string;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(brandAssets).values({
    id, name: data.name, category: data.category, filePath: data.filePath, description: data.description,
    version: 1, status: 'draft', createdBy: data.createdBy, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getBrandAssetById(id: string) {
  return db.select().from(brandAssets).where(eq(brandAssets.id, id)).get();
}

export function getAllBrandAssets(options: { category?: string; status?: string; limit?: number; offset?: number } = {}) {
  const { category, status, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (category) conditions.push(eq(brandAssets.category, category as 'logo' | 'color_palette' | 'typography' | 'guideline_doc' | 'template' | 'other'));
  if (status) conditions.push(eq(brandAssets.status, status as 'draft' | 'approved' | 'deprecated'));
  const query = conditions.length ? db.select().from(brandAssets).where(and(...conditions)) : db.select().from(brandAssets);
  const items = query.orderBy(desc(brandAssets.createdAt)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(brandAssets).where(and(...conditions)) : db.select().from(brandAssets)).all().length;
  return { items, total };
}

export function updateBrandAsset(id: string, data: Partial<{
  name: string; status: 'draft' | 'approved' | 'deprecated'; filePath: string; description: string; version: number;
}>) {
  db.update(brandAssets).set({ ...data, updatedAt: new Date() }).where(eq(brandAssets.id, id)).run();
}

export function deleteBrandAsset(id: string) {
  db.delete(brandAssets).where(eq(brandAssets.id, id)).run();
}
