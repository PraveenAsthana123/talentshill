// ── Evaluation types ──

interface RetrievedChunk {
  content: string;
  score: number;
}

interface EvaluationResult {
  faithfulness: number;
  relevance: number;
  precision: number;
  recall: number;
}

// ── Utility functions ──

/**
 * Tokenize text into lowercase words for keyword comparison.
 */
function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2); // Filter out very short words
  return new Set(words);
}

/**
 * Compute keyword overlap ratio between two texts.
 * Returns a value between 0 and 1.
 */
function keywordOverlap(textA: string, textB: string): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.size === 0 || tokensB.size === 0) {
    return 0;
  }

  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  // Jaccard-like overlap: intersection / union
  const unionSize = new Set([...tokensA, ...tokensB]).size;
  if (unionSize === 0) {
    return 0;
  }

  return intersectionCount / unionSize;
}

// ── Main evaluation function ──

/**
 * Evaluate retrieval quality using RAGAS-compatible metrics.
 *
 * Computes four metrics:
 *
 * - **faithfulness** (0-1): Keyword overlap between the query and the
 *   combined retrieved content. Measures how well the retrieved chunks
 *   address the query terms.
 *
 * - **relevance** (0-1): Average retrieval score across all retrieved chunks.
 *   Reflects the raw similarity/ranking confidence from the retrieval system.
 *
 * - **precision** (0-1): Proportion of retrieved chunks that are considered
 *   relevant (score above a threshold of 0.3). Measures how many of the
 *   retrieved results are actually useful.
 *
 * - **recall** (0-1): If a referenceAnswer is provided, this is the keyword
 *   overlap between the reference answer and the combined retrieved content.
 *   If no reference is provided, defaults to the relevance score.
 *
 * @param query - The user's search query
 * @param retrievedChunks - Array of retrieved chunks with content and scores
 * @param referenceAnswer - Optional ground-truth answer for recall computation
 */
export function evaluateRetrieval(
  query: string,
  retrievedChunks: RetrievedChunk[],
  referenceAnswer?: string
): EvaluationResult {
  if (retrievedChunks.length === 0) {
    return {
      faithfulness: 0,
      relevance: 0,
      precision: 0,
      recall: 0,
    };
  }

  // Combine all retrieved chunk content into one string
  const combinedContent = retrievedChunks
    .map((chunk) => chunk.content)
    .join('\n');

  // Faithfulness: keyword overlap between query and retrieved content
  const faithfulness = keywordOverlap(query, combinedContent);

  // Relevance: average retrieval score
  const totalScore = retrievedChunks.reduce((sum, chunk) => sum + chunk.score, 0);
  const relevance = totalScore / retrievedChunks.length;

  // Precision: proportion of chunks with score above threshold
  const relevanceThreshold = 0.3;
  const relevantChunkCount = retrievedChunks.filter(
    (chunk) => chunk.score > relevanceThreshold
  ).length;
  const precision = relevantChunkCount / retrievedChunks.length;

  // Recall: keyword overlap with reference answer, or fallback to relevance
  let recall: number;
  if (referenceAnswer !== undefined && referenceAnswer.trim().length > 0) {
    recall = keywordOverlap(referenceAnswer, combinedContent);
  } else {
    recall = relevance;
  }

  // Clamp all values to [0, 1]
  return {
    faithfulness: clamp(faithfulness),
    relevance: clamp(relevance),
    precision: clamp(precision),
    recall: clamp(recall),
  };
}

/**
 * Clamp a value between 0 and 1.
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}
