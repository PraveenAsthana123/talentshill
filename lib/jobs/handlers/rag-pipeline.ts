import { registerHandler } from '../handlers';
import { JOB_TYPES } from '../types';
import type { JobContext } from '../types';
import { ingestDocument } from '@/lib/rag/ingestion';
import { chunkDocument } from '@/lib/rag/chunking';
import { DummyEmbeddingProvider, embedChunks } from '@/lib/rag/embedding';
import { evaluateRetrieval } from '@/lib/rag/evaluation';
import { hybridRetrieve } from '@/lib/rag/retrieval';
import { createRun, updateRunStatus, addRunStep, addRunMetric } from '@/lib/db/rag-run-queries';
import { getChunksByDocument } from '@/lib/db/rag-chunk-queries';

async function handleRagIngest(ctx: JobContext) {
  const { documentId, chunkSize = 500, chunkOverlap = 50 } = ctx.payload as {
    documentId: string;
    chunkSize?: number;
    chunkOverlap?: number;
  };

  const runId = createRun({
    type: 'ingestion',
    config: { chunkSize, chunkOverlap },
    documentIds: [documentId],
  });

  updateRunStatus(runId, 'running');
  const startTime = Date.now();

  try {
    // Step 1: Ingest
    ctx.log('info', 'Starting document ingestion', { documentId });
    addRunStep({ runId, stepName: 'ingest', status: 'running' });
    const text = await ingestDocument(documentId);
    addRunStep({ runId, stepName: 'ingest', status: 'completed', output: { textLength: text.length }, durationMs: Date.now() - startTime });

    // Step 2: Chunk
    const chunkStart = Date.now();
    ctx.log('info', 'Chunking document', { documentId, chunkSize, chunkOverlap });
    addRunStep({ runId, stepName: 'chunk', status: 'running' });
    await chunkDocument(documentId, { chunkSize, chunkOverlap });
    const chunks = getChunksByDocument(documentId, 0, 1000);
    addRunStep({ runId, stepName: 'chunk', status: 'completed', output: { chunkCount: chunks.length }, durationMs: Date.now() - chunkStart });

    updateRunStatus(runId, 'completed');
    ctx.log('info', 'Ingestion pipeline completed', { documentId, chunkCount: chunks.length });
    return { runId, chunkCount: chunks.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    updateRunStatus(runId, 'failed', message);
    ctx.log('error', 'Ingestion pipeline failed', { documentId, error: message });
    throw err;
  }
}

async function handleRagEmbed(ctx: JobContext) {
  const { documentId } = ctx.payload as { documentId: string };

  const runId = createRun({
    type: 'embedding',
    documentIds: [documentId],
  });

  updateRunStatus(runId, 'running');
  const startTime = Date.now();

  try {
    ctx.log('info', 'Starting embedding generation', { documentId });
    addRunStep({ runId, stepName: 'embed', status: 'running' });

    const chunks = getChunksByDocument(documentId, 0, 10000);
    const chunkIds = chunks.map((c: { id: string }) => c.id);
    const provider = new DummyEmbeddingProvider();
    await embedChunks(chunkIds, provider);

    addRunStep({ runId, stepName: 'embed', status: 'completed', output: { embeddedCount: chunkIds.length }, durationMs: Date.now() - startTime });
    updateRunStatus(runId, 'completed');

    ctx.log('info', 'Embedding pipeline completed', { documentId, embeddedCount: chunkIds.length });
    return { runId, embeddedCount: chunkIds.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    updateRunStatus(runId, 'failed', message);
    ctx.log('error', 'Embedding pipeline failed', { documentId, error: message });
    throw err;
  }
}

async function handleRagEvaluate(ctx: JobContext) {
  const { query, referenceAnswer } = ctx.payload as { query: string; referenceAnswer?: string };

  const runId = createRun({
    type: 'evaluation',
    config: { query },
  });

  updateRunStatus(runId, 'running');
  const startTime = Date.now();

  try {
    ctx.log('info', 'Starting RAG evaluation', { query });
    addRunStep({ runId, stepName: 'retrieve', status: 'running' });

    const results = await hybridRetrieve(query, { k: 5 });
    addRunStep({ runId, stepName: 'retrieve', status: 'completed', output: { resultCount: results.length }, durationMs: Date.now() - startTime });

    const evalStart = Date.now();
    addRunStep({ runId, stepName: 'evaluate', status: 'running' });
    const metrics = evaluateRetrieval(query, results, referenceAnswer);

    addRunMetric({ runId, metricName: 'faithfulness', value: metrics.faithfulness });
    addRunMetric({ runId, metricName: 'relevance', value: metrics.relevance });
    addRunMetric({ runId, metricName: 'precision', value: metrics.precision });
    addRunMetric({ runId, metricName: 'recall', value: metrics.recall });

    addRunStep({ runId, stepName: 'evaluate', status: 'completed', output: { ...metrics }, durationMs: Date.now() - evalStart });
    updateRunStatus(runId, 'completed');

    ctx.log('info', 'RAG evaluation completed', { query, metrics });
    return { runId, metrics };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    updateRunStatus(runId, 'failed', message);
    ctx.log('error', 'RAG evaluation failed', { query, error: message });
    throw err;
  }
}

// Register all RAG handlers
registerHandler(JOB_TYPES.RAG_INGEST, handleRagIngest);
registerHandler(JOB_TYPES.RAG_EMBED, handleRagEmbed);
registerHandler(JOB_TYPES.RAG_EVALUATE, handleRagEvaluate);
