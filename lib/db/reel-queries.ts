import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { reels } = schema;

export function createReel(data: {
  title: string;
  platform: 'instagram' | 'tiktok' | 'youtube_shorts' | 'other';
  caption?: string;
  assetUrl?: string;
  scheduledAt?: Date;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(reels).values({
    id, title: data.title, platform: data.platform, status: 'idea',
    caption: data.caption, assetUrl: data.assetUrl, scheduledAt: data.scheduledAt,
    createdBy: data.createdBy, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getReelById(id: string) {
  return db.select().from(reels).where(eq(reels.id, id)).get();
}

export function getAllReels(options: { status?: string; platform?: string; limit?: number; offset?: number } = {}) {
  const { status, platform, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (status) conditions.push(eq(reels.status, status as 'idea' | 'scripted' | 'filmed' | 'edited' | 'scheduled' | 'published'));
  if (platform) conditions.push(eq(reels.platform, platform as 'instagram' | 'tiktok' | 'youtube_shorts' | 'other'));
  const query = conditions.length ? db.select().from(reels).where(and(...conditions)) : db.select().from(reels);
  const items = query.orderBy(desc(reels.createdAt)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(reels).where(and(...conditions)) : db.select().from(reels)).all().length;
  return { items, total };
}

export function updateReel(id: string, data: Partial<{
  title: string; status: 'idea' | 'scripted' | 'filmed' | 'edited' | 'scheduled' | 'published';
  caption: string; assetUrl: string; scheduledAt: Date; publishedAt: Date;
}>) {
  db.update(reels).set({ ...data, updatedAt: new Date() }).where(eq(reels.id, id)).run();
}

export function deleteReel(id: string) {
  db.delete(reels).where(eq(reels.id, id)).run();
}
