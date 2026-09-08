import { db, schema } from './index';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { webhooks } = schema;

export function createWebhook(data: {
  accountId?: string;
  name: string;
  url: string;
  secret?: string;
  events?: string[];
  createdBy?: string;
}) {
  const id = randomUUID();
  db.insert(webhooks).values({
    id,
    accountId: data.accountId ?? null,
    name: data.name,
    url: data.url,
    secret: data.secret ?? randomUUID(),
    events: data.events ? JSON.stringify(data.events) : null,
    isActive: true,
    failCount: 0,
    createdBy: data.createdBy ?? null,
    createdAt: new Date(),
  }).run();
  return id;
}

export function getWebhookById(id: string) {
  return db.select().from(webhooks).where(eq(webhooks.id, id)).get();
}

export function getAllWebhooks() {
  return db.select().from(webhooks).all();
}

export function getActiveWebhooks() {
  return db.select().from(webhooks).where(eq(webhooks.isActive, true)).all();
}

export function updateWebhook(id: string, data: Partial<{ name: string; url: string; events: string[]; isActive: boolean }>) {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.url !== undefined) updates.url = data.url;
  if (data.events !== undefined) updates.events = JSON.stringify(data.events);
  if (data.isActive !== undefined) updates.isActive = data.isActive;
  db.update(webhooks).set(updates).where(eq(webhooks.id, id)).run();
}

export function deleteWebhook(id: string) {
  db.delete(webhooks).where(eq(webhooks.id, id)).run();
}

export function incrementFailCount(id: string) {
  db.update(webhooks).set({ failCount: sql`fail_count + 1` }).where(eq(webhooks.id, id)).run();
}

export function resetFailCount(id: string) {
  db.update(webhooks).set({ failCount: 0 }).where(eq(webhooks.id, id)).run();
}
