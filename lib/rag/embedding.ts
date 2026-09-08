import { getChunksByIds } from '@/lib/db/rag-chunk-queries';
import { storeEmbeddings } from '@/lib/db/rag-embedding-queries';
import { updateDocumentStatus } from '@/lib/db/rag-document-queries';

// ── Embedding provider interface ──

export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
  modelName: string;
  dimensions: number;
}

// ── Dummy provider for development ──

/**
 * DummyEmbeddingProvider generates random 384-dimensional vectors.
 * Intended for development and testing only -- not for production use.
 */
export class DummyEmbeddingProvider implements EmbeddingProvider {
  readonly modelName = 'dummy-384';
  readonly dimensions = 384;

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map(() => this.generateRandomVector());
  }

  private generateRandomVector(): number[] {
    const vector: number[] = [];
    for (let i = 0; i < this.dimensions; i++) {
      vector.push(Math.random() * 2 - 1);
    }
    // Normalize to unit length
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] = vector[i] / magnitude;
      }
    }
    return vector;
  }
}

// ── Embed chunks and persist ──

/**
 * Embed chunks by their IDs:
 * 1. Fetch chunks from the database
 * 2. Generate embeddings using the provided EmbeddingProvider
 * 3. Store embeddings in the database
 * 4. Update the parent document status to 'embedded'
 */
export async function embedChunks(
  chunkIds: string[],
  provider: EmbeddingProvider
): Promise<void> {
  if (chunkIds.length === 0) {
    return;
  }

  const chunks = getChunksByIds(chunkIds);

  if (chunks.length === 0) {
    throw new Error('No chunks found for the provided IDs');
  }

  const texts = chunks.map((chunk) => chunk.content);
  const vectors = await provider.embed(texts);

  // Build embedding records for storage (serialize vectors to JSON strings)
  const embeddingRecords = chunks.map((chunk, index) => ({
    chunkId: chunk.id,
    model: provider.modelName,
    dimensions: provider.dimensions,
    vector: JSON.stringify(vectors[index]),
  }));

  storeEmbeddings(embeddingRecords);

  // Collect unique document IDs from the chunks and update their status
  const documentIds = [...new Set(chunks.map((chunk) => chunk.documentId))];
  for (const docId of documentIds) {
    updateDocumentStatus(docId, 'embedded');
  }
}
