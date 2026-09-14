import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { contentTopics } = schema;
type TopicStatus = 'proposed' | 'scheduled' | 'generated' | 'published';

export function createTopic(data: {
  title: string;
  targetContentType: string;
  personaId?: string;
  scheduledDate?: Date;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(contentTopics).values({
    id, title: data.title, targetContentType: data.targetContentType,
    personaId: data.personaId, scheduledDate: data.scheduledDate,
    status: data.scheduledDate ? 'scheduled' : 'proposed',
    createdBy: data.createdBy, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getTopicById(id: string) {
  return db.select().from(contentTopics).where(eq(contentTopics.id, id)).get();
}

export function getAllTopics(options: { status?: TopicStatus } = {}) {
  const conditions = options.status ? [eq(contentTopics.status, options.status)] : [];
  const query = conditions.length ? db.select().from(contentTopics).where(and(...conditions)) : db.select().from(contentTopics);
  return query.orderBy(desc(contentTopics.scheduledDate)).all();
}

export function updateTopic(id: string, data: Partial<{ status: TopicStatus; generatedContentId: string; scheduledDate: Date }>) {
  db.update(contentTopics).set({ ...data, updatedAt: new Date() }).where(eq(contentTopics.id, id)).run();
}

export function deleteTopic(id: string) {
  db.delete(contentTopics).where(eq(contentTopics.id, id)).run();
}
