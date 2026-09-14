import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { marketResearchBriefs } = schema;

export function createMarketResearchBrief(data: {
  title: string;
  topic: string;
  sourceNotes?: string;
  findings?: string;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(marketResearchBriefs).values({
    id, title: data.title, topic: data.topic, status: 'draft',
    sourceNotes: data.sourceNotes, findings: data.findings,
    createdBy: data.createdBy, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getMarketResearchBriefById(id: string) {
  return db.select().from(marketResearchBriefs).where(eq(marketResearchBriefs.id, id)).get();
}

export function getAllMarketResearchBriefs(options: { status?: string; limit?: number; offset?: number } = {}) {
  const { status, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (status) conditions.push(eq(marketResearchBriefs.status, status as 'draft' | 'in_review' | 'published'));
  const query = conditions.length ? db.select().from(marketResearchBriefs).where(and(...conditions)) : db.select().from(marketResearchBriefs);
  const items = query.orderBy(desc(marketResearchBriefs.createdAt)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(marketResearchBriefs).where(and(...conditions)) : db.select().from(marketResearchBriefs)).all().length;
  return { items, total };
}

export function updateMarketResearchBrief(id: string, data: Partial<{
  title: string; status: 'draft' | 'in_review' | 'published'; sourceNotes: string; findings: string;
}>) {
  db.update(marketResearchBriefs).set({ ...data, updatedAt: new Date() }).where(eq(marketResearchBriefs.id, id)).run();
}

export function deleteMarketResearchBrief(id: string) {
  db.delete(marketResearchBriefs).where(eq(marketResearchBriefs.id, id)).run();
}
