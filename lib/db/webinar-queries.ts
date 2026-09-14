import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { webinars, webinarRegistrants } = schema;

export function createWebinar(data: {
  title: string;
  topic: string;
  scheduledAt: Date;
  durationMinutes?: number;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(webinars).values({
    id, title: data.title, topic: data.topic, scheduledAt: data.scheduledAt,
    durationMinutes: data.durationMinutes ?? null, status: 'scheduled',
    createdBy: data.createdBy, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getWebinarById(id: string) {
  return db.select().from(webinars).where(eq(webinars.id, id)).get();
}

export function getAllWebinars(options: { status?: string; limit?: number; offset?: number } = {}) {
  const { status, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (status) conditions.push(eq(webinars.status, status as 'scheduled' | 'completed' | 'cancelled'));
  const query = conditions.length ? db.select().from(webinars).where(and(...conditions)) : db.select().from(webinars);
  const items = query.orderBy(desc(webinars.scheduledAt)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(webinars).where(and(...conditions)) : db.select().from(webinars)).all().length;
  return { items, total };
}

export function updateWebinarStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled') {
  db.update(webinars).set({ status, updatedAt: new Date() }).where(eq(webinars.id, id)).run();
}

export function deleteWebinar(id: string) {
  db.delete(webinarRegistrants).where(eq(webinarRegistrants.webinarId, id)).run();
  db.delete(webinars).where(eq(webinars.id, id)).run();
}

export function createRegistrant(data: {
  webinarId: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  consent: boolean;
  registeredAt?: Date;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(webinarRegistrants).values({
    id, webinarId: data.webinarId, fullName: data.fullName, email: data.email,
    phone: data.phone ?? null, company: data.company ?? null, consent: data.consent,
    registeredAt: data.registeredAt ?? now, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getRegistrantsForWebinar(webinarId: string) {
  return db.select().from(webinarRegistrants).where(eq(webinarRegistrants.webinarId, webinarId)).orderBy(desc(webinarRegistrants.registeredAt)).all();
}

export function getRegistrantById(id: string) {
  return db.select().from(webinarRegistrants).where(eq(webinarRegistrants.id, id)).get();
}

export function recordAttendance(id: string, data: { attended: boolean; engagementNotes?: string }) {
  db.update(webinarRegistrants).set({
    attended: data.attended, engagementNotes: data.engagementNotes ?? null, updatedAt: new Date(),
  }).where(eq(webinarRegistrants.id, id)).run();
}

export function setRegistrantQualification(id: string, data: { qualificationScore: number; qualificationTier: 'hot' | 'warm' | 'cool' | 'cold'; contactSubmissionId?: string }) {
  const updates: Record<string, unknown> = { qualificationScore: data.qualificationScore, qualificationTier: data.qualificationTier, updatedAt: new Date() };
  if (data.contactSubmissionId) updates.contactSubmissionId = data.contactSubmissionId;
  db.update(webinarRegistrants).set(updates).where(eq(webinarRegistrants.id, id)).run();
}

export function getAllRegistrantsAcrossWebinars() {
  return db.select().from(webinarRegistrants).all();
}
