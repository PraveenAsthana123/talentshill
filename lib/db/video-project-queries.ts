import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { videoProjects } = schema;

export function createVideoProject(data: {
  title: string;
  tool: 'adobe_premiere' | 'adobe_after_effects' | 'capcut' | 'heygen' | 'other';
  strategyNotes?: string;
  outputUrl?: string;
  durationSeconds?: number;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(videoProjects).values({
    id, title: data.title, tool: data.tool, status: 'planning',
    strategyNotes: data.strategyNotes, outputUrl: data.outputUrl, durationSeconds: data.durationSeconds,
    createdBy: data.createdBy, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getVideoProjectById(id: string) {
  return db.select().from(videoProjects).where(eq(videoProjects.id, id)).get();
}

export function getAllVideoProjects(options: { status?: string; tool?: string; limit?: number; offset?: number } = {}) {
  const { status, tool, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (status) conditions.push(eq(videoProjects.status, status as 'planning' | 'in_progress' | 'review' | 'published'));
  if (tool) conditions.push(eq(videoProjects.tool, tool as 'adobe_premiere' | 'adobe_after_effects' | 'capcut' | 'heygen' | 'other'));
  const query = conditions.length ? db.select().from(videoProjects).where(and(...conditions)) : db.select().from(videoProjects);
  const items = query.orderBy(desc(videoProjects.createdAt)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(videoProjects).where(and(...conditions)) : db.select().from(videoProjects)).all().length;
  return { items, total };
}

export function updateVideoProject(id: string, data: Partial<{
  title: string; status: 'planning' | 'in_progress' | 'review' | 'published'; strategyNotes: string; outputUrl: string; durationSeconds: number;
}>) {
  db.update(videoProjects).set({ ...data, updatedAt: new Date() }).where(eq(videoProjects.id, id)).run();
}

export function deleteVideoProject(id: string) {
  db.delete(videoProjects).where(eq(videoProjects.id, id)).run();
}
