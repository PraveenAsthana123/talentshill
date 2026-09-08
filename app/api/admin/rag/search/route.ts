import { NextRequest, NextResponse } from 'next/server';
import { hybridRetrieve } from '@/lib/rag/retrieval';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';

export const POST = withPermission('rag', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const userId = await getSessionUserIdAsync(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, k, vectorWeight, keywordWeight, rerankEnabled, lambda } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'query is required and must be a non-empty string' }, { status: 400 });
    }

    const config = {
      k: k ?? 10,
      vectorWeight: vectorWeight ?? 0.7,
      keywordWeight: keywordWeight ?? 0.3,
      rerankEnabled: rerankEnabled ?? false,
      lambda: lambda ?? 0.7,
    };

    const results = await hybridRetrieve(query.trim(), config);

    return NextResponse.json({
      query: query.trim(),
      config,
      results,
      totalResults: results.length,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
});
