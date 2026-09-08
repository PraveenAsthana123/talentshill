import { db, schema } from './index';
import { eq, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { integrationLogs } = schema;

export function addLog(data: {
  accountId: string;
  action: string;
  status: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
  durationMs?: number;
}) {
  const id = randomUUID();
  db.insert(integrationLogs).values({
    id,
    accountId: data.accountId,
    action: data.action,
    status: data.status,
    request: data.request ? JSON.stringify(data.request) : null,
    response: data.response ? JSON.stringify(data.response) : null,
    durationMs: data.durationMs ?? null,
    createdAt: new Date(),
  }).run();
  return id;
}

export function getLogs(accountId: string, options: { offset?: number; limit?: number } = {}) {
  const { offset = 0, limit = 50 } = options;
  return db.select().from(integrationLogs).where(eq(integrationLogs.accountId, accountId)).orderBy(desc(integrationLogs.createdAt)).limit(limit).offset(offset).all();
}

export function getLogCount(accountId: string) {
  return db.select({ count: sql<number>`count(*)` }).from(integrationLogs).where(eq(integrationLogs.accountId, accountId)).get()?.count ?? 0;
}
