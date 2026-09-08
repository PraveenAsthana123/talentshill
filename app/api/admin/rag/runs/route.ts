import { NextRequest, NextResponse } from 'next/server';
import { getAllRuns, createRun } from '@/lib/db/rag-run-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';

export const GET = withPermission('rag', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = getAllRuns({ type, status, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 });
  }
});

export const POST = withPermission('rag', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const userId = await getSessionUserIdAsync(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, documentIds, config } = body;

    if (!type) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 });
    }

    const validTypes = ['ingest', 'chunk', 'embed', 'full_pipeline', 'evaluation'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const id = createRun({
      type,
      documentIds,
      config,
      createdBy: userId,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create run' }, { status: 500 });
  }
});
