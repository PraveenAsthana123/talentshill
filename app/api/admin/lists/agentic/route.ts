import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runListSyncAgent } from '@/lib/agents/list-sync-agent';

export const POST = withPermission('lists', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { listId?: string } | null;
  if (!body?.listId) return NextResponse.json({ error: 'listId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runListSyncAgent({ listId: body.listId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.listId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
