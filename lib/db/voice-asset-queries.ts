import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { voiceAssets } = schema;

export function createVoiceAsset(data: {
  title: string;
  type: 'script' | 'recording' | 'transcript';
  content?: string;
  filePath?: string;
  durationSeconds?: number;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(voiceAssets).values({
    id, title: data.title, type: data.type, status: 'draft',
    content: data.content, filePath: data.filePath, durationSeconds: data.durationSeconds,
    createdBy: data.createdBy, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getVoiceAssetById(id: string) {
  return db.select().from(voiceAssets).where(eq(voiceAssets.id, id)).get();
}

export function getAllVoiceAssets(options: { type?: string; status?: string; limit?: number; offset?: number } = {}) {
  const { type, status, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (type) conditions.push(eq(voiceAssets.type, type as 'script' | 'recording' | 'transcript'));
  if (status) conditions.push(eq(voiceAssets.status, status as 'draft' | 'recorded' | 'approved'));
  const query = conditions.length ? db.select().from(voiceAssets).where(and(...conditions)) : db.select().from(voiceAssets);
  const items = query.orderBy(desc(voiceAssets.createdAt)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(voiceAssets).where(and(...conditions)) : db.select().from(voiceAssets)).all().length;
  return { items, total };
}

export function updateVoiceAsset(id: string, data: Partial<{
  title: string; status: 'draft' | 'recorded' | 'approved'; content: string; filePath: string; durationSeconds: number;
}>) {
  db.update(voiceAssets).set({ ...data, updatedAt: new Date() }).where(eq(voiceAssets.id, id)).run();
}

export function deleteVoiceAsset(id: string) {
  db.delete(voiceAssets).where(eq(voiceAssets.id, id)).run();
}
