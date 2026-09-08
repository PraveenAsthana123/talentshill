import { randomUUID } from 'crypto';
import { eq, like, sql, count, desc, and } from 'drizzle-orm';
import { db, schema } from './index';

const { marketingContent } = schema;

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function createContent(data: {
  title: string;
  contentType: string;
  body?: string;
  excerpt?: string;
  tags?: string[];
  category?: string;
  coverImage?: string;
  authorId?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  const slug = generateSlug(data.title) + '-' + id.slice(0, 6);
  db.insert(marketingContent)
    .values({
      id,
      title: data.title,
      slug,
      contentType: data.contentType,
      body: data.body || '',
      excerpt: data.excerpt,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      category: data.category,
      coverImage: data.coverImage,
      authorId: data.authorId,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

export function getContentById(id: string) {
  return db.select().from(marketingContent).where(eq(marketingContent.id, id)).get();
}

export function getContentBySlug(slug: string) {
  return db.select().from(marketingContent).where(eq(marketingContent.slug, slug)).get();
}

export function getContentList(
  offset = 0,
  limit = 50,
  filters?: { contentType?: string; status?: string; search?: string }
) {
  const conditions = [];
  if (filters?.contentType) conditions.push(eq(marketingContent.contentType, filters.contentType));
  if (filters?.status) conditions.push(eq(marketingContent.status, filters.status));
  if (filters?.search) conditions.push(like(marketingContent.title, `%${filters.search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(marketingContent)
    .where(where)
    .orderBy(desc(marketingContent.updatedAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export function getContentCount(filters?: { contentType?: string; status?: string }) {
  const conditions = [];
  if (filters?.contentType) conditions.push(eq(marketingContent.contentType, filters.contentType));
  if (filters?.status) conditions.push(eq(marketingContent.status, filters.status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const result = db.select({ cnt: count() }).from(marketingContent).where(where).get();
  return result?.cnt ?? 0;
}

export function updateContent(id: string, data: Partial<{
  title: string;
  body: string;
  excerpt: string;
  tags: string[];
  category: string;
  coverImage: string;
  status: string;
  metadata: Record<string, unknown>;
}>) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.body !== undefined) updates.body = data.body;
  if (data.excerpt !== undefined) updates.excerpt = data.excerpt;
  if (data.tags !== undefined) updates.tags = JSON.stringify(data.tags);
  if (data.category !== undefined) updates.category = data.category;
  if (data.coverImage !== undefined) updates.coverImage = data.coverImage;
  if (data.status !== undefined) updates.status = data.status;
  if (data.metadata !== undefined) updates.metadata = JSON.stringify(data.metadata);

  db.update(marketingContent).set(updates).where(eq(marketingContent.id, id)).run();
}

export function publishContent(id: string) {
  db.update(marketingContent)
    .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(marketingContent.id, id))
    .run();
}

export function archiveContent(id: string) {
  db.update(marketingContent)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(marketingContent.id, id))
    .run();
}

export function deleteContent(id: string) {
  db.delete(marketingContent).where(eq(marketingContent.id, id)).run();
}
