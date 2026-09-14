import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { youtubeVideos } = schema;

export function createYoutubeVideo(data: {
  title: string;
  description?: string;
  tags?: string;
  scheduledAt?: Date;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(youtubeVideos).values({
    id, title: data.title, description: data.description, tags: data.tags, status: 'planned',
    scheduledAt: data.scheduledAt, createdBy: data.createdBy, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getYoutubeVideoById(id: string) {
  return db.select().from(youtubeVideos).where(eq(youtubeVideos.id, id)).get();
}

export function getAllYoutubeVideos(options: { status?: string; limit?: number; offset?: number } = {}) {
  const { status, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (status) conditions.push(eq(youtubeVideos.status, status as 'planned' | 'recorded' | 'edited' | 'scheduled' | 'published'));
  const query = conditions.length ? db.select().from(youtubeVideos).where(and(...conditions)) : db.select().from(youtubeVideos);
  const items = query.orderBy(desc(youtubeVideos.createdAt)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(youtubeVideos).where(and(...conditions)) : db.select().from(youtubeVideos)).all().length;
  return { items, total };
}

export function updateYoutubeVideo(id: string, data: Partial<{
  title: string; status: 'planned' | 'recorded' | 'edited' | 'scheduled' | 'published';
  description: string; tags: string; externalVideoId: string; scheduledAt: Date; publishedAt: Date;
}>) {
  db.update(youtubeVideos).set({ ...data, updatedAt: new Date() }).where(eq(youtubeVideos.id, id)).run();
}

export function deleteYoutubeVideo(id: string) {
  db.delete(youtubeVideos).where(eq(youtubeVideos.id, id)).run();
}
