import { NextRequest, NextResponse } from 'next/server';
import { getBroadcastById, updateBroadcast, deleteBroadcast, launchBroadcast } from '@/lib/db/broadcast-queries';
import { withPermission, getSessionUserIdAsync, checkPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';
import { createJob } from '@/lib/db/job-queries';

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
      const broadcast = getBroadcastById(id);
      if (!broadcast) return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });

      launchBroadcast(id);

      // Real fix: nothing anywhere created a broadcast_send job --
      // launchBroadcast() only ever flipped the DB status to 'sending';
      // handleBroadcastSend (lib/jobs/handlers/broadcast-sender.ts) was
      // fully implemented but unreachable, so "Launch" never actually
      // sent a single email. This enqueues the real send job.
      const jobId = createJob({
        type: 'broadcast_send',
        payload: { broadcastId: id },
        priority: 1,
        maxRetries: 3,
        createdBy: userId,
      });

      logOperationRun({ moduleKey: 'broadcasts', operationName: 'manual_launch_broadcast', executionMode: 'manual', status: 'completed', inputPayload: { id, jobId }, triggeredBy: userId });
      return NextResponse.json({ success: true, jobId });
    }

    if (!checkPermission(userId, 'broadcasts', 'update')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    updateBroadcast(id, body);
    logOperationRun({ moduleKey: 'broadcasts', operationName: 'manual_update_broadcast', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update broadcast' }, { status: 500 });
  }
}

export const DELETE = withPermission('broadcasts', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    deleteBroadcast(id);
    logOperationRun({ moduleKey: 'broadcasts', operationName: 'manual_delete_broadcast', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete broadcast' }, { status: 500 });
  }
});
