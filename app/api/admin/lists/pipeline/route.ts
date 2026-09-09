import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runListSyncPipeline } from '@/lib/pipelines/list-sync-pipeline';

export const POST = withPermission('lists', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { listId?: string } | null;
  if (!body?.listId) return NextResponse.json({ error: 'listId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runListSyncPipeline({ listId: body.listId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.listId ? 200 : 404 });
});
