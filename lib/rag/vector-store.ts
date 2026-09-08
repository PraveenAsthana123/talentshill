import { getAllEmbeddings } from '@/lib/db/rag-embedding-queries';

interface VectorEntry {
  chunkId: string;
  vector: number[];
}

interface SearchResult {
  chunkId: string;
  score: number;
}

/**
 * In-memory vector store for brute-force similarity search.
 *
 * Loads embeddings from the database into memory and provides
 * cosine similarity search with optional MMR reranking for diversity.
 */
export class InMemoryVectorStore {
  private entries: VectorEntry[] = [];

  /**
   * Load all embeddings from the database into memory.
   */
  loadFromDB(): void {
    const rows = getAllEmbeddings();
    this.entries = rows.map((row) => ({
      chunkId: row.chunkId,
      vector: typeof row.vector === 'string' ? JSON.parse(row.vector) as number[] : row.vector,
    }));
  }

  /**
   * Add a single embedding to the in-memory store.
   */
  addEmbedding(chunkId: string, vector: number[]): void {
    this.entries.push({ chunkId, vector });
  }

  /**
   * Compute cosine similarity between two vectors.
   * Returns a value between -1 and 1, where 1 means identical direction.
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error(
        `Vector dimension mismatch: ${a.length} vs ${b.length}`
      );
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Brute-force top-k similarity search.
   * Returns the k most similar chunks sorted by descending score.
   */
  search(queryEmbedding: number[], k: number): SearchResult[] {
    const scored: SearchResult[] = this.entries.map((entry) => ({
      chunkId: entry.chunkId,
      score: this.cosineSimilarity(queryEmbedding, entry.vector),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, k);
  }

  /**
   * Maximal Marginal Relevance (MMR) reranking for diversity.
   *
   * Balances relevance (similarity to query) with diversity (dissimilarity
   * to already-selected results).
   *
   * @param results - Initial search results with scores
   * @param lambda - Trade-off parameter: 1.0 = pure relevance, 0.0 = pure diversity
   * @param k - Number of results to return after reranking
   */
  mmrRerank(
    results: SearchResult[],
    lambda: number,
    k: number
  ): SearchResult[] {
    if (results.length <= k) {
      return results;
    }

    // Build a lookup from chunkId to vector for the candidates
    const vectorMap = new Map<string, number[]>();
    for (const entry of this.entries) {
      vectorMap.set(entry.chunkId, entry.vector);
    }

    const selected: SearchResult[] = [];
    const candidates = [...results];

    // Greedily select k items using MMR criterion
    while (selected.length < k && candidates.length > 0) {
      let bestIdx = -1;
      let bestMmrScore = -Infinity;

      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const relevanceScore = candidate.score;

        // Compute max similarity to any already-selected item
        let maxSimilarityToSelected = 0;
        const candidateVector = vectorMap.get(candidate.chunkId);

        if (candidateVector && selected.length > 0) {
          for (const sel of selected) {
            const selVector = vectorMap.get(sel.chunkId);
            if (selVector) {
              const sim = this.cosineSimilarity(candidateVector, selVector);
              maxSimilarityToSelected = Math.max(maxSimilarityToSelected, sim);
            }
          }
        }

        const mmrScore =
          lambda * relevanceScore - (1 - lambda) * maxSimilarityToSelected;

        if (mmrScore > bestMmrScore) {
          bestMmrScore = mmrScore;
          bestIdx = i;
        }
      }

      if (bestIdx >= 0) {
        selected.push({
          chunkId: candidates[bestIdx].chunkId,
          score: candidates[bestIdx].score,
        });
        candidates.splice(bestIdx, 1);
      } else {
        break;
      }
    }

    return selected;
  }

  /**
   * Returns the number of embeddings currently loaded.
   */
  get size(): number {
    return this.entries.length;
  }

  /**
   * Get the raw vector for a given chunkId, or undefined if not found.
   */
  getVector(chunkId: string): number[] | undefined {
    const entry = this.entries.find((e) => e.chunkId === chunkId);
    return entry?.vector;
  }
}
