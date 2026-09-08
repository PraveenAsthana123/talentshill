import { randomUUID } from 'crypto';
import { eq, inArray, sql } from 'drizzle-orm';
import { db, schema } from './index';

const { ragEmbeddings, ragChunks } = schema;

// ── Batch insert embeddings ──
export function storeEmbeddings(
  embeddings: {
    chunkId: string;
    model: string;
    dimensions: number;
    vector: string; // JSON-serialized float array
  }[]
) {
  const now = new Date();
  const ids: string[] = [];

  for (const emb of embeddings) {
    const id = randomUUID();
    ids.push(id);
    db.insert(ragEmbeddings)
      .values({
        id,
        chunkId: emb.chunkId,
        model: emb.model,
        dimensions: emb.dimensions,
        vector: emb.vector,
        createdAt: now,
      })
      .run();
  }

  return ids;
}

// ── Get embeddings by chunk IDs ──
export function getEmbeddingsByChunkIds(chunkIds: string[]) {
  if (chunkIds.length === 0) return [];
  return db
    .select()
    .from(ragEmbeddings)
    .where(inArray(ragEmbeddings.chunkId, chunkIds))
    .all();
}

// ── Get all embeddings (for loading into vector store) ──
export function getAllEmbeddings() {
  return db.select().from(ragEmbeddings).all();
}

// ── Delete embeddings by document (via join with ragChunks) ──
export function deleteEmbeddingsByDocument(documentId: string) {
  // First get all chunk IDs for this document
  const chunks = db
    .select({ id: ragChunks.id })
    .from(ragChunks)
    .where(eq(ragChunks.documentId, documentId))
    .all();

  if (chunks.length === 0) return 0;

  const chunkIds = chunks.map((c) => c.id);
  const result = db
    .delete(ragEmbeddings)
    .where(inArray(ragEmbeddings.chunkId, chunkIds))
    .run();

  return result.changes;
}
