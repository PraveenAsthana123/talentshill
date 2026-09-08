import { db, schema } from './index';
import { eq, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { broadcasts } = schema;

export function createBroadcast(data: {
  name: string;
  subject: string;
  htmlContent: string;
  profileId?: string;
  audienceType?: string;
  audienceId?: string;
  scheduledAt?: Date;
  throttlePerMinute?: number;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(broadcasts).values({
    id,
    name: data.name,
    subject: data.subject,
    htmlContent: data.htmlContent,
    profileId: data.profileId ?? null,
    audienceType: data.audienceType || 'list',
    audienceId: data.audienceId ?? null,
    status: 'draft',
    scheduledAt: data.scheduledAt ?? null,
    throttlePerMinute: data.throttlePerMinute ?? 60,
    createdBy: data.createdBy ?? null,
    createdAt: now,
    updatedAt: now,
  }).run();
  return id;
}

export function getAllBroadcasts() {
  return db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt)).all();
}

export function getBroadcastById(id: string) {
  return db.select().from(broadcasts).where(eq(broadcasts.id, id)).get();
}

export function updateBroadcast(id: string, data: Partial<{
  name: string;
  subject: string;
  htmlContent: string;
  profileId: string;
  audienceType: string;
  audienceId: string;
  status: string;
  scheduledAt: Date;
  throttlePerMinute: number;
}>) {
  db.update(broadcasts).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(broadcasts.id, id)).run();
}

export function deleteBroadcast(id: string) {
  db.delete(broadcasts).where(eq(broadcasts.id, id)).run();
}

export function updateBroadcastCounters(id: string, sent: number, failed: number) {
  db.update(broadcasts).set({
    totalSent: sql`${broadcasts.totalSent} + ${sent}`,
    totalFailed: sql`${broadcasts.totalFailed} + ${failed}`,
    updatedAt: new Date(),
  }).where(eq(broadcasts.id, id)).run();
}

export function launchBroadcast(id: string) {
  db.update(broadcasts).set({
    status: 'sending',
    startedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(broadcasts.id, id)).run();
}

export function completeBroadcast(id: string) {
  db.update(broadcasts).set({
    status: 'completed',
    completedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(broadcasts.id, id)).run();
}
