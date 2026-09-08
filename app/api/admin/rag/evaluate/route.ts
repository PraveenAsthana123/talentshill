import { NextRequest, NextResponse } from 'next/server';
import { hybridRetrieve } from '@/lib/rag/retrieval';
import { evaluateRetrieval } from '@/lib/rag/evaluation';
import { getActiveConfig } from '@/lib/db/rag-run-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';

export const POST = withPermission('rag', 'manage')(async (request: NextRequest, _context: unknown) => {
  try {
    const userId = await getSessionUserIdAsync(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, referenceAnswer } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Use active config or sensible defaults
    const activeConfig = getActiveConfig();
    const parsedConfig = activeConfig?.config
      ? (typeof activeConfig.config === 'string'
          ? JSON.parse(activeConfig.config)
          : activeConfig.config)
      : {};

    const retrievalConfig = {
      k: parsedConfig.retrievalK ?? 10,
      vectorWeight: parsedConfig.vectorWeight ?? 0.7,
      keywordWeight: parsedConfig.keywordWeight ?? 0.3,
      rerankEnabled: parsedConfig.rerankEnabled ?? false,
      lambda: parsedConfig.lambda ?? 0.7,
    };

    // Retrieve chunks
    const retrievedChunks = await hybridRetrieve(query.trim(), retrievalConfig);

    // Evaluate retrieval quality using RAGAS-style metrics
    const metrics = evaluateRetrieval(
      query.trim(),
      retrievedChunks.map((chunk) => ({
        content: chunk.content,
        score: chunk.score,
      })),
      referenceAnswer
    );

    return NextResponse.json({
      query: query.trim(),
      referenceAnswer: referenceAnswer || null,
      retrievalConfig,
      retrievedChunks: retrievedChunks.length,
      metrics,
      chunks: retrievedChunks,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to run evaluation' }, { status: 500 });
  }
});
