import { NextRequest, NextResponse } from 'next/server';
import { getRun, updateRunStatus, getRunTimeline } from '@/lib/db/run-queries';
import { withPermission } from '@/lib/security/rbac';

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
    if (body.status) {
      updateRunStatus(id, body.status);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update run' }, { status: 500 });
  }
});
