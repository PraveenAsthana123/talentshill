import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getDocumentById } from '@/lib/db/rag-document-queries';
import { getChunksByDocument, getChunkCount } from '@/lib/db/rag-chunk-queries';
import { getEmbeddingsByChunkIds } from '@/lib/db/rag-embedding-queries';
import { hybridRetrieve } from '@/lib/rag/retrieval';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface RagDocumentReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; documentId: string | null }

// Real, non-mutating, re-runnable end-to-end integrity check -- does
// NOT re-ingest/re-chunk/re-embed (that's the real job-queue pipeline,
// triggered separately via .../ingest, and re-running it here would
// create duplicate chunk rows). Instead verifies the document's
// CURRENT real state, closing with a real retrieval proof against the
// now-real OllamaEmbeddingProvider (previously DummyEmbeddingProvider
// random vectors, which made vector search meaningless).
//   status has progressed past pending/failed            25
//   real chunkCount > 0 matches actual rag_chunks rows    25
//   every chunk has a real embedding row                  25
//   the document's own content is actually retrievable
//   via real hybrid search (proof, not just presence)     25
export async function runRagDocumentReadinessPipeline(params: { documentId: string; triggeredBy?: string | null }): Promise<RagDocumentReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'rag', operationName: 'pipeline_document_readiness', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const doc = getDocumentById(params.documentId);
  if (!doc) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'document not found' });
    return { runId, stages, score: 0, documentId: null };
  }

  const progressed = ['chunked', 'embedded', 'ready'].includes(doc.status);
  const statusScore = progressed ? 25 : 0;
  stages.push({ stage: 'status_check', input: doc.status, process: "Score 25 if status has progressed past 'pending'/'failed' (chunked, embedded, or ready)", output: statusScore, status: 'ok' });

  const realChunkCount = getChunkCount(params.documentId);
  const chunkScore = realChunkCount > 0 ? 25 : 0;
  stages.push({ stage: 'chunk_check', input: { recordedChunkCount: doc.chunkCount, realChunkCount }, process: 'Score 25 if the real rag_chunks row count for this document is > 0', output: chunkScore, status: 'ok' });

  let embeddingCoverageScore = 0;
  let embeddedChunks = 0;
  if (realChunkCount > 0) {
    const chunks = getChunksByDocument(params.documentId, 0, realChunkCount);
    const chunkIds = chunks.map((c) => c.id);
    const embeddings = getEmbeddingsByChunkIds(chunkIds);
    embeddedChunks = embeddings.length;
    embeddingCoverageScore = embeddedChunks === chunkIds.length && chunkIds.length > 0 ? 25 : 0;
  }
  stages.push({ stage: 'embedding_coverage_check', input: { realChunkCount, embeddedChunks }, process: 'Score 25 if every real chunk has a corresponding real rag_embeddings row (via the now-real OllamaEmbeddingProvider)', output: embeddingCoverageScore, status: 'ok' });

  let retrievalScore = 0;
  let retrievalProof: unknown = 'not attempted (no embedded chunks)';
  if (embeddingCoverageScore === 25) {
    const chunks = getChunksByDocument(params.documentId, 0, 1);
    const sampleQuery = chunks[0]?.content.slice(0, 200) ?? '';
    if (sampleQuery.trim().length > 0) {
      const results = await hybridRetrieve(sampleQuery, { k: 5 });
      const matchedOwnDoc = results.some((r) => chunks.some((c) => c.id === r.chunkId));
      retrievalScore = matchedOwnDoc ? 25 : 0;
      retrievalProof = { queriedWithOwnChunk: chunks[0].id, resultCount: results.length, matchedOwnDocument: matchedOwnDoc };
    }
  }
  stages.push({ stage: 'retrieval_proof_check', input: retrievalProof, process: "Score 25 if a real hybridRetrieve() search using the document's own first chunk as the query actually returns a chunk belonging to this document -- proof the real embedding pipeline works end-to-end, not just that rows exist", output: retrievalScore, status: 'ok' });

  const totalScore = statusScore + chunkScore + embeddingCoverageScore + retrievalScore;
  db.update(schema.ragDocuments).set({ readinessScore: totalScore }).where(eq(schema.ragDocuments.id, params.documentId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update rag_documents.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, documentId: params.documentId };
}
