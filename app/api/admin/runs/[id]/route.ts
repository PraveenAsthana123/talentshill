import { NextRequest, NextResponse } from 'next/server';
import { getRun, updateRunStatus, getRunTimeline, addRunEvent } from '@/lib/db/run-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('runs', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const run = getRun(id);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }
    const events = getRunTimeline(id);
    return NextResponse.json({ run, events });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch run' }, { status: 500 });
  }
});

export const PATCH = withPermission('runs', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    if (body.status) {
      const before = getRun(id);
      updateRunStatus(id, body.status);
      addRunEvent(id, 'status_forced', `Status manually forced ${before?.status ?? 'unknown'} -> ${body.status} by an admin`, { from: before?.status, to: body.status });
      logOperationRun({ moduleKey: 'runs', operationName: 'manual_force_run_status', executionMode: 'manual', status: 'completed', inputPayload: { id, from: before?.status, to: body.status }, triggeredBy: userId });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update run' }, { status: 500 });
  }
});
