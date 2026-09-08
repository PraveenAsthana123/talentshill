import { randomUUID } from 'crypto';
import { eq, inArray, sql, count } from 'drizzle-orm';
import { db, schema } from './index';

const { ragChunks } = schema;

// ── Batch insert chunks ──
export function createChunks(
  chunks: {
    documentId: string;
    chunkIndex: number;
    content: string;
    tokenCount?: number;
    metadata?: Record<string, unknown>;
    hash?: string;
  }[]
) {
  const now = new Date();
  const ids: string[] = [];

  for (const chunk of chunks) {
    const id = randomUUID();
    ids.push(id);
    db.insert(ragChunks)
      .values({
        id,
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        tokenCount: chunk.tokenCount,
        metadata: chunk.metadata ? JSON.stringify(chunk.metadata) : undefined,
        hash: chunk.hash,
        createdAt: now,
      })
      .run();
  }

  return ids;
}

// ── Get chunks by document (paginated) ──
export function getChunksByDocument(
  documentId: string,
  offset = 0,
  limit = 50
) {
  return db
    .select()
    .from(ragChunks)
    .where(eq(ragChunks.documentId, documentId))
    .orderBy(ragChunks.chunkIndex)
    .limit(limit)
    .offset(offset)
    .all();
}

// ── Get chunks by IDs ──
export function getChunksByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.select().from(ragChunks).where(inArray(ragChunks.id, ids)).all();
}

// ── Get chunk by ID ──
export function getChunkById(id: string) {
  return db.select().from(ragChunks).where(eq(ragChunks.id, id)).get();
}

// ── Delete all chunks for a document ──
export function deleteChunksByDocument(documentId: string) {
  const result = db
    .delete(ragChunks)
    .where(eq(ragChunks.documentId, documentId))
    .run();
  return result.changes;
}

// ── Get chunk count for a document ──
export function getChunkCount(documentId: string) {
  const result = db
    .select({ cnt: count() })
    .from(ragChunks)
    .where(eq(ragChunks.documentId, documentId))
    .get();
  return result?.cnt ?? 0;
}
