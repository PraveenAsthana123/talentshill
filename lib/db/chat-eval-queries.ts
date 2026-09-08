import { db, schema } from './index';
import { eq, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { chatMessageEvals } = schema;

export function createEval(data: {
  messageId: string;
  evalType: string;
  score?: number;
  passed: boolean;
  details?: Record<string, unknown>;
}) {
  const id = randomUUID();
  db.insert(chatMessageEvals).values({
    id,
    messageId: data.messageId,
    evalType: data.evalType,
    score: data.score ?? null,
    passed: data.passed,
    details: data.details ? JSON.stringify(data.details) : null,
    evaluatedAt: new Date(),
  }).run();
  return id;
}

export function getEvalsForMessage(messageId: string) {
  return db.select().from(chatMessageEvals).where(eq(chatMessageEvals.messageId, messageId)).all();
}

export function getFailedEvals(options: { offset?: number; limit?: number } = {}) {
  const { offset = 0, limit = 50 } = options;
  return db.select().from(chatMessageEvals).where(eq(chatMessageEvals.passed, false)).orderBy(desc(chatMessageEvals.evaluatedAt)).limit(limit).offset(offset).all();
}

export function getEvalStats() {
  const total = db.select({ count: sql<number>`count(*)` }).from(chatMessageEvals).get()?.count ?? 0;
  const passed = db.select({ count: sql<number>`count(*)` }).from(chatMessageEvals).where(eq(chatMessageEvals.passed, true)).get()?.count ?? 0;
  const failed = total - passed;
  return { total, passed, failed };
}
