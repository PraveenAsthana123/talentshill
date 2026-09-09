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

// ── Real local Ollama embedding provider ──

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11435';
const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text:latest';
const OLLAMA_EMBEDDING_DIMENSIONS = 768;

/**
 * Real embedding provider backed by local Ollama (nomic-embed-text by
 * default). Per this workspace's RAG+Ollama mandatory-default policy --
 * this is the module's default provider; DummyEmbeddingProvider above
 * remains available for dev/test only, per its own doc comment.
 */
export class OllamaEmbeddingProvider implements EmbeddingProvider {
  readonly modelName = OLLAMA_EMBEDDING_MODEL;
  readonly dimensions = OLLAMA_EMBEDDING_DIMENSIONS;

  async embed(texts: string[]): Promise<number[][]> {
    const vectors: number[][] = [];
    for (const text of texts) {
      const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: OLLAMA_EMBEDDING_MODEL, prompt: text }),
        signal: AbortSignal.timeout(60000),
      });
      if (!res.ok) {
        throw new Error(`Ollama embeddings request failed: HTTP ${res.status} ${await res.text().catch(() => '')}`);
      }
      const data = await res.json() as { embedding?: number[] };
      if (!data.embedding || data.embedding.length !== this.dimensions) {
        throw new Error(`Ollama embeddings returned unexpected dimensions (got ${data.embedding?.length ?? 0}, expected ${this.dimensions})`);
      }
      vectors.push(data.embedding);
    }
    return vectors;
  }
}

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
