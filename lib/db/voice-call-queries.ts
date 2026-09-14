import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { voiceCallLogs } = schema;

export function createVoiceCallLog(data: {
  contactId?: string;
  direction: 'inbound' | 'outbound';
  phoneNumber?: string;
  transcript: string;
  durationSeconds?: number;
  callDate?: Date;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(voiceCallLogs).values({
    id,
    contactId: data.contactId ?? null,
    direction: data.direction,
    phoneNumber: data.phoneNumber ?? null,
    transcript: data.transcript,
    durationSeconds: data.durationSeconds ?? null,
    callDate: data.callDate ?? now,
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now,
  }).run();
  return id;
}

export function getVoiceCallLogById(id: string) {
  return db.select().from(voiceCallLogs).where(eq(voiceCallLogs.id, id)).get();
}

export function getAllVoiceCallLogs(options: { tier?: string; limit?: number; offset?: number } = {}) {
  const { tier, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (tier) conditions.push(eq(voiceCallLogs.qualificationTier, tier as 'cold' | 'warm' | 'hot'));
  const query = conditions.length ? db.select().from(voiceCallLogs).where(and(...conditions)) : db.select().from(voiceCallLogs);
  const items = query.orderBy(desc(voiceCallLogs.callDate)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(voiceCallLogs).where(and(...conditions)) : db.select().from(voiceCallLogs)).all().length;
  return { items, total };
}

export function setCallQualification(id: string, data: { qualificationScore: number; qualificationTier: 'cold' | 'warm' | 'hot'; contactId?: string }) {
  const updates: Record<string, unknown> = { qualificationScore: data.qualificationScore, qualificationTier: data.qualificationTier, updatedAt: new Date() };
  if (data.contactId) updates.contactId = data.contactId;
  db.update(voiceCallLogs).set(updates).where(eq(voiceCallLogs.id, id)).run();
}

export function deleteVoiceCallLog(id: string) {
  db.delete(voiceCallLogs).where(eq(voiceCallLogs.id, id)).run();
}
