import { db, schema } from './index';
import { eq, desc, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { chatSessions, chatRequests, chatMessages, contacts } = schema;

// Session functions
export function createSession(data: {
  visitorEmail?: string;
  visitorName?: string;
  sessionToken: string;
  ipHash?: string;
  userAgent?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(chatSessions).values({
    id,
    visitorEmail: data.visitorEmail ?? null,
    visitorName: data.visitorName ?? null,
    sessionToken: data.sessionToken,
    ipHash: data.ipHash ?? null,
    userAgent: data.userAgent ?? null,
    status: 'active',
    startedAt: now,
    lastMessageAt: now,
  }).run();
  return id;
}

export function getSessionByToken(token: string) {
  return db.select().from(chatSessions).where(eq(chatSessions.sessionToken, token)).get();
}

export function getSessionById(id: string) {
  return db.select().from(chatSessions).where(eq(chatSessions.id, id)).get();
}

export function captureEmail(sessionId: string, email: string, name?: string) {
  db.update(chatSessions).set({
    visitorEmail: email,
    visitorName: name ?? null,
    emailCapturedAt: new Date(),
  }).where(eq(chatSessions.id, sessionId)).run();
}

export function updateSessionStatus(id: string, status: string) {
  db.update(chatSessions).set({ status }).where(eq(chatSessions.id, id)).run();
}

export function getAllSessions(options: { offset?: number; limit?: number; status?: string } = {}) {
  const { offset = 0, limit = 50, status } = options;
  let query = db.select().from(chatSessions).orderBy(desc(chatSessions.lastMessageAt));
  if (status) {
    return query.where(eq(chatSessions.status, status)).limit(limit).offset(offset).all();
  }
  return query.limit(limit).offset(offset).all();
}

export function getSessionCount(status?: string) {
  if (status) {
    return db.select({ count: sql<number>`count(*)` }).from(chatSessions).where(eq(chatSessions.status, status)).get()?.count ?? 0;
  }
  return db.select({ count: sql<number>`count(*)` }).from(chatSessions).get()?.count ?? 0;
}

// Request functions
export function createRequest(data: {
  sessionId: string;
  contactId?: string;
  subject?: string;
  category?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(chatRequests).values({
    id,
    sessionId: data.sessionId,
    contactId: data.contactId ?? null,
    subject: data.subject ?? null,
    category: data.category ?? null,
    status: 'new',
    priority: 'medium',
    createdAt: now,
    updatedAt: now,
  }).run();
  return id;
}

export function getRequest(id: string) {
  return db.select().from(chatRequests).where(eq(chatRequests.id, id)).get();
}

export function updateRequestStatus(id: string, status: string) {
  const updates: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status === 'resolved') updates.resolvedAt = new Date();
  if (status === 'closed') updates.closedAt = new Date();
  db.update(chatRequests).set(updates).where(eq(chatRequests.id, id)).run();
}

export function assignRequest(id: string, assignedTo: string) {
  db.update(chatRequests).set({ assignedTo, updatedAt: new Date() }).where(eq(chatRequests.id, id)).run();
}

export function getRequestsByStatus(status: string, options: { offset?: number; limit?: number } = {}) {
  const { offset = 0, limit = 50 } = options;
  return db.select().from(chatRequests).where(eq(chatRequests.status, status)).orderBy(desc(chatRequests.createdAt)).limit(limit).offset(offset).all();
}

export function getRequestsBySession(sessionId: string) {
  return db.select().from(chatRequests).where(eq(chatRequests.sessionId, sessionId)).orderBy(desc(chatRequests.createdAt)).all();
}

export function getAllRequests(options: { offset?: number; limit?: number; status?: string; priority?: string } = {}) {
  const { offset = 0, limit = 50, status, priority } = options;
  const conditions = [];
  if (status) conditions.push(eq(chatRequests.status, status));
  if (priority) conditions.push(eq(chatRequests.priority, priority));

  let query = db.select().from(chatRequests).orderBy(desc(chatRequests.createdAt));
  if (conditions.length > 0) {
    return query.where(and(...conditions)).limit(limit).offset(offset).all();
  }
  return query.limit(limit).offset(offset).all();
}

export function getRequestCount(status?: string) {
  if (status) {
    return db.select({ count: sql<number>`count(*)` }).from(chatRequests).where(eq(chatRequests.status, status)).get()?.count ?? 0;
  }
  return db.select({ count: sql<number>`count(*)` }).from(chatRequests).get()?.count ?? 0;
}

// Message functions
export function createMessage(data: {
  sessionId: string;
  requestId?: string;
  role: string;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const id = randomUUID();
  db.insert(chatMessages).values({
    id,
    sessionId: data.sessionId,
    requestId: data.requestId ?? null,
    role: data.role,
    content: data.content,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    createdAt: new Date(),
  }).run();

  // Update session last message time
  db.update(chatSessions).set({ lastMessageAt: new Date() }).where(eq(chatSessions.id, data.sessionId)).run();

  return id;
}

export function getMessages(sessionId: string) {
  return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt).all();
}

export function getConversation(sessionId: string) {
  const session = getSessionById(sessionId);
  const messages = getMessages(sessionId);
  const requests = getRequestsBySession(sessionId);
  return { session, messages, requests };
}
