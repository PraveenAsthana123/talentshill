import { getChunkById } from '@/lib/db/rag-chunk-queries';
import { InMemoryVectorStore } from '@/lib/rag/vector-store';
import { OllamaEmbeddingProvider } from '@/lib/rag/embedding';

interface RetrievalResult {
  chunkId: string;
  content: string;
  score: number;
}

interface HybridRetrievalConfig {
  k: number;
  vectorWeight?: number;
  keywordWeight?: number;
  rerankEnabled?: boolean;
  lambda?: number;
}

// ── BM25 keyword scoring ──

/**
 * Tokenize a string into lowercase word tokens, filtering out short noise.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

/**
 * Compute term frequency for a list of tokens.
 */
function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  return tf;
}

/**
 * Compute a BM25-inspired score between a query and a document.
 *
 * Uses TF-IDF approximation:
 * - Term frequency (TF): count of query term in document, normalized
 * - Inverse document frequency (IDF): approximated as log(1 + 1 / (1 + df))
 *   where df is whether the term appears in the document (0 or 1)
 *
 * BM25 parameters: k1 = 1.5, b = 0.75
 */
export function bm25Score(query: string, document: string): number {
  const queryTokens = tokenize(query);
  const docTokens = tokenize(document);

  if (queryTokens.length === 0 || docTokens.length === 0) {
    return 0;
  }

  const docTf = termFrequency(docTokens);
  const docLength = docTokens.length;
  // Assume average doc length is the current doc length for single-doc scoring
  const avgDocLength = docLength;

  const k1 = 1.5;
  const b = 0.75;

  let score = 0;

  for (const qToken of queryTokens) {
    const tf = docTf.get(qToken) || 0;
    if (tf === 0) continue;

    // IDF approximation: treat df as 1 (term appears in this doc)
    // With N=2 (simulating minimal corpus), df=1: idf = log((2 - 1 + 0.5) / (1 + 0.5))
    const idf = Math.log(1 + (1 / (1 + 1)));

    // BM25 TF component
    const tfNorm =
      (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLength / avgDocLength)));

    score += idf * tfNorm;
  }

  return score;
}

// ── Reciprocal Rank Fusion ──

/**
 * Combine two ranked lists using Reciprocal Rank Fusion (RRF).
 *
 * RRF score = sum over each list of: weight / (k + rank)
 * where k is a constant (default 60) to prevent top-heavy bias.
 */
function reciprocalRankFusion(
  vectorResults: Array<{ chunkId: string; score: number }>,
  keywordResults: Array<{ chunkId: string; score: number }>,
  vectorWeight: number,
  keywordWeight: number
): Array<{ chunkId: string; score: number }> {
  const rrfK = 60;
  const fusedScores = new Map<string, number>();

  // Add vector search contributions
  for (let rank = 0; rank < vectorResults.length; rank++) {
    const { chunkId } = vectorResults[rank];
    const rrfScore = vectorWeight / (rrfK + rank + 1);
    fusedScores.set(chunkId, (fusedScores.get(chunkId) || 0) + rrfScore);
  }

  // Add keyword search contributions
  for (let rank = 0; rank < keywordResults.length; rank++) {
    const { chunkId } = keywordResults[rank];
    const rrfScore = keywordWeight / (rrfK + rank + 1);
    fusedScores.set(chunkId, (fusedScores.get(chunkId) || 0) + rrfScore);
  }

  const fused = Array.from(fusedScores.entries()).map(([chunkId, score]) => ({
    chunkId,
    score,
  }));

  fused.sort((a, b) => b.score - a.score);

  return fused;
}

// ── Hybrid retrieval ──

/**
 * Hybrid retrieval combining vector search with BM25 keyword scoring.
 *
 * 1. Embeds the query using OllamaEmbeddingProvider (real local Ollama
 *    embeddings, nomic-embed-text by default)
 * 2. Performs vector similarity search via InMemoryVectorStore
 * 3. Computes BM25 keyword scores for the same candidates
 * 4. Fuses results using Reciprocal Rank Fusion
 * 5. Optionally reranks using MMR for diversity
 * 6. Returns top-k chunks with content and scores
 */
export async function hybridRetrieve(
  query: string,
  config: HybridRetrievalConfig
): Promise<RetrievalResult[]> {
  const {
    k,
    vectorWeight = 0.7,
    keywordWeight = 0.3,
    rerankEnabled = false,
    lambda = 0.7,
  } = config;

  // Fetch more candidates than needed for fusion
  const candidateCount = k * 3;

  // Vector search
  const provider = new OllamaEmbeddingProvider();
  const store = new InMemoryVectorStore();
  store.loadFromDB();

  const queryEmbedding = (await provider.embed([query]))[0];
  const vectorResults = store.search(queryEmbedding, candidateCount);

  // Retrieve content for all vector candidates to compute BM25
  const candidateChunkIds = vectorResults.map((r) => r.chunkId);
  const chunkContents = new Map<string, string>();

  for (const chunkId of candidateChunkIds) {
    const chunk = getChunkById(chunkId);
    if (chunk) {
      chunkContents.set(chunkId, chunk.content);
    }
  }

  // Keyword scoring for all candidates
  const keywordResults: Array<{ chunkId: string; score: number }> = [];
  for (const [chunkId, content] of chunkContents) {
    const score = bm25Score(query, content);
    keywordResults.push({ chunkId, score });
  }
  keywordResults.sort((a, b) => b.score - a.score);

  // Fuse results using Reciprocal Rank Fusion
  let fusedResults = reciprocalRankFusion(
    vectorResults,
    keywordResults,
    vectorWeight,
    keywordWeight
  );

  // Optional MMR reranking for diversity
  if (rerankEnabled) {
    fusedResults = store.mmrRerank(fusedResults, lambda, k);
  }

  // Take top-k and attach content
  const topResults = fusedResults.slice(0, k);

  const results: RetrievalResult[] = [];
  for (const result of topResults) {
    const content = chunkContents.get(result.chunkId);
    if (content) {
      results.push({
        chunkId: result.chunkId,
        content,
        score: result.score,
      });
    }
  }

  return results;
}
