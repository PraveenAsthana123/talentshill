import { db, schema } from './index';
import { eq, desc, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { runs, runEvents } = schema;

export function createRun(data: {
  type: string;
  entityId?: string;
  name: string;
  status?: string;
  config?: Record<string, unknown>;
  createdBy?: string;
}) {
  const id = randomUUID();
  db.insert(runs).values({
    id,
    type: data.type,
    entityId: data.entityId ?? null,
    name: data.name,
    status: data.status || 'draft',
    config: data.config ? JSON.stringify(data.config) : null,
    createdBy: data.createdBy ?? null,
    createdAt: new Date(),
  }).run();
  return id;
}

export function getRun(id: string) {
  return db.select().from(runs).where(eq(runs.id, id)).get();
}

export function getAllRuns(filters?: { type?: string; status?: string }, offset = 0, limit = 50) {
  let query = db.select().from(runs);
  const conditions = [];
  if (filters?.type) conditions.push(eq(runs.type, filters.type));
  if (filters?.status) conditions.push(eq(runs.status, filters.status));
  if (conditions.length > 0) {
    query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions)) as typeof query;
  }
  return query.orderBy(desc(runs.createdAt)).limit(limit).offset(offset).all();
}

export function getRunCount(filters?: { type?: string; status?: string }) {
  let query = db.select({ count: sql<number>`count(*)` }).from(runs);
  const conditions = [];
  if (filters?.type) conditions.push(eq(runs.type, filters.type));
  if (filters?.status) conditions.push(eq(runs.status, filters.status));
  if (conditions.length > 0) {
    query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions)) as typeof query;
  }
  return query.get()?.count || 0;
}

export function updateRunStatus(id: string, status: string) {
  const updates: Record<string, unknown> = { status };
  if (status === 'active') updates.startedAt = new Date();
  if (status === 'completed' || status === 'failed') updates.completedAt = new Date();
  db.update(runs).set(updates).where(eq(runs.id, id)).run();
}

export function getActiveRuns() {
  return db.select().from(runs)
    .where(eq(runs.status, 'active'))
    .orderBy(desc(runs.createdAt))
    .all();
}

export function getRunsByType(type: string) {
  return db.select().from(runs)
    .where(eq(runs.type, type))
    .orderBy(desc(runs.createdAt))
    .all();
}

export function addRunEvent(runId: string, eventType: string, message: string, metadata?: Record<string, unknown>) {
  const id = randomUUID();
  db.insert(runEvents).values({
    id,
    runId,
    eventType,
    message,
    metadata: metadata ? JSON.stringify(metadata) : null,
    createdAt: new Date(),
  }).run();
  return id;
}

export function getRunTimeline(runId: string) {
  return db.select().from(runEvents)
    .where(eq(runEvents.runId, runId))
    .orderBy(desc(runEvents.createdAt))
    .all();
}
