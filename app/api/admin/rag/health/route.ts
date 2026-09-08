import { NextRequest, NextResponse } from 'next/server';
import { getDocumentStats } from '@/lib/db/rag-document-queries';
import { getAllEmbeddings } from '@/lib/db/rag-embedding-queries';
import { getCacheStats } from '@/lib/db/rag-cache-queries';
import { getAllRuns } from '@/lib/db/rag-run-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('rag', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    // Document counts by status
    const documentStats = getDocumentStats();

    // Total chunks — derived from document stats chunkCount is not available
    // so we use the total from documentStats as a proxy
    // For accurate chunk count, we count total embeddings
    const allEmbeddings = getAllEmbeddings();
    const totalEmbeddings = allEmbeddings.length;

    // Cache stats
    const cacheStats = getCacheStats();

    // Last run status
    const recentRuns = getAllRuns({ limit: 1, offset: 0 });
    const lastRun = recentRuns.items.length > 0 ? recentRuns.items[0] : null;

    return NextResponse.json({
      documents: documentStats,
      totalEmbeddings,
      cache: cacheStats,
      lastRun: lastRun
        ? {
            id: lastRun.id,
            type: lastRun.type,
            status: lastRun.status,
            createdAt: lastRun.createdAt,
            completedAt: lastRun.completedAt,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch health data' }, { status: 500 });
  }
});
