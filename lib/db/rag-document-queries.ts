import { randomUUID } from 'crypto';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import { db, schema } from './index';

const { ragDocuments } = schema;

// ── Create document ──
export function createDocument(data: {
  name: string;
  sourceType: string;
  sourceUrl?: string;
  filePath?: string;
  mimeType?: string;
  size?: number;
  metadata?: Record<string, unknown>;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(ragDocuments)
    .values({
      id,
      name: data.name,
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl,
      filePath: data.filePath,
      mimeType: data.mimeType,
      size: data.size,
      status: 'pending',
      chunkCount: 0,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

// ── Get document by ID ──
export function getDocumentById(id: string) {
  return db.select().from(ragDocuments).where(eq(ragDocuments.id, id)).get();
}

// ── Get all documents (filtered, paginated) ──
export function getAllDocuments(options: {
  status?: string;
  sourceType?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { status, sourceType, limit = 50, offset = 0 } = options;

  const conditions = [];
  if (status) conditions.push(eq(ragDocuments.status, status));
  if (sourceType) conditions.push(eq(ragDocuments.sourceType, sourceType));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = db
    .select({ cnt: count() })
    .from(ragDocuments)
    .where(where)
    .get();
  const total = totalResult?.cnt ?? 0;

  const items = db
    .select()
    .from(ragDocuments)
    .where(where)
    .orderBy(desc(ragDocuments.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

  return { items, total };
}

// ── Update document status ──
export function updateDocumentStatus(
  id: string,
  status: string,
  chunkCount?: number
) {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };
  if (chunkCount !== undefined) {
    updates.chunkCount = chunkCount;
  }
  db.update(ragDocuments)
    .set(updates)
    .where(eq(ragDocuments.id, id))
    .run();
}

// ── Delete document ──
export function deleteDocument(id: string) {
  const result = db.delete(ragDocuments).where(eq(ragDocuments.id, id)).run();
  return result.changes > 0;
}

// ── Get document stats (counts by status) ──
export function getDocumentStats() {
  const rows = db
    .select({
      status: ragDocuments.status,
      cnt: count(),
    })
    .from(ragDocuments)
    .groupBy(ragDocuments.status)
    .all();

  const stats: Record<string, number> = {};
  for (const row of rows) {
    stats[row.status] = row.cnt;
  }

  const total = Object.values(stats).reduce((sum, v) => sum + v, 0);
  return { byStatus: stats, total };
}
