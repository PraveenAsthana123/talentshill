import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { videoClipPlans } = schema;

export function createClipPlan(data: {
  sourceProjectId: string;
  title: string;
  startSeconds: number;
  endSeconds: number;
  targetPlatform: 'instagram_reels' | 'tiktok' | 'youtube_shorts' | 'linkedin' | 'other';
  targetAspectRatio: '9:16' | '1:1' | '16:9' | '4:5';
  notes?: string;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(videoClipPlans).values({
    id, sourceProjectId: data.sourceProjectId, title: data.title,
    startSeconds: data.startSeconds, endSeconds: data.endSeconds,
    targetPlatform: data.targetPlatform, targetAspectRatio: data.targetAspectRatio,
    status: 'planned', notes: data.notes ?? null,
    createdBy: data.createdBy, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getClipPlanById(id: string) {
  return db.select().from(videoClipPlans).where(eq(videoClipPlans.id, id)).get();
}

export function getClipPlansForSource(sourceProjectId: string) {
  return db.select().from(videoClipPlans).where(eq(videoClipPlans.sourceProjectId, sourceProjectId)).orderBy(desc(videoClipPlans.createdAt)).all();
}

export function getAllClipPlans(options: { status?: string; limit?: number; offset?: number } = {}) {
  const { status, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (status) conditions.push(eq(videoClipPlans.status, status as 'planned' | 'ready_for_edit' | 'delivered'));
  const query = conditions.length ? db.select().from(videoClipPlans).where(and(...conditions)) : db.select().from(videoClipPlans);
  const items = query.orderBy(desc(videoClipPlans.createdAt)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(videoClipPlans).where(and(...conditions)) : db.select().from(videoClipPlans)).all().length;
  return { items, total };
}

export function updateClipPlan(id: string, data: Partial<{
  title: string; startSeconds: number; endSeconds: number;
  targetPlatform: 'instagram_reels' | 'tiktok' | 'youtube_shorts' | 'linkedin' | 'other';
  targetAspectRatio: '9:16' | '1:1' | '16:9' | '4:5';
  status: 'planned' | 'ready_for_edit' | 'delivered'; outputUrl: string; notes: string;
}>) {
  db.update(videoClipPlans).set({ ...data, updatedAt: new Date() }).where(eq(videoClipPlans.id, id)).run();
}

export function setClipPlanReadiness(id: string, readinessScore: number) {
  db.update(videoClipPlans).set({ readinessScore, updatedAt: new Date() }).where(eq(videoClipPlans.id, id)).run();
}

export function deleteClipPlan(id: string) {
  db.delete(videoClipPlans).where(eq(videoClipPlans.id, id)).run();
}
