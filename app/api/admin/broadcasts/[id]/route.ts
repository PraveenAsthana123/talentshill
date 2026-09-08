import { NextRequest, NextResponse } from 'next/server';
import { getBroadcastById, updateBroadcast, deleteBroadcast, launchBroadcast } from '@/lib/db/broadcast-queries';
import { withPermission, getSessionUserIdAsync, checkPermission } from '@/lib/security/rbac';

export const GET = withPermission('broadcasts', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const broadcast = getBroadcastById(id);
    if (!broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }
    return NextResponse.json({ broadcast });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch broadcast' }, { status: 500 });
  }
});

// Not wrapped in withPermission(...) at the top level -- 'launch' is a
// state-transition bundled into the same handler as a plain field edit.
// A single 'update' gate (the earlier interim fix) let anyone who can edit
// a broadcast's fields also launch it to its full audience; per-branch
// checks close that without adding a new route.
export async function PATCH(request: NextRequest, context: unknown) {
  const { params } = context as { params: Promise<{ id: string }> };
  const userId = await getSessionUserIdAsync(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'launch') {
      if (!checkPermission(userId, 'broadcasts', 'manage')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      launchBroadcast(id);
      return NextResponse.json({ success: true });
    }

    if (!checkPermission(userId, 'broadcasts', 'update')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    updateBroadcast(id, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update broadcast' }, { status: 500 });
  }
}

export const DELETE = withPermission('broadcasts', 'delete')(async (
  _request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    deleteBroadcast(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete broadcast' }, { status: 500 });
  }
});
