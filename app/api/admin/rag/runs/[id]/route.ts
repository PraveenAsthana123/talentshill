import { NextRequest, NextResponse } from 'next/server';
import { getRunById } from '@/lib/db/rag-run-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('rag', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const run = getRunById(id);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    // run already includes steps and metrics from getRunById
    return NextResponse.json({
      run: {
        id: run.id,
        type: run.type,
        status: run.status,
        config: run.config,
        documentIds: run.documentIds,
        error: run.error,
        createdBy: run.createdBy,
        createdAt: run.createdAt,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
      },
      steps: run.steps,
      metrics: run.metrics,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch run' }, { status: 500 });
  }
});
