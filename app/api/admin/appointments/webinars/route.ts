import { NextRequest, NextResponse } from 'next/server';
import { getAllWebinars, createWebinar } from '@/lib/db/webinar-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('appointments', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const result = getAllWebinars({ status, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch webinars' }, { status: 500 });
  }
});

export const POST = withPermission('appointments', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { title, topic, scheduledAt } = body;
    if (!title || !topic || !scheduledAt) return NextResponse.json({ error: 'title, topic, and scheduledAt are required' }, { status: 400 });
    const userId = await getSessionUserIdAsync(request);
    const id = createWebinar({ title, topic, scheduledAt: new Date(scheduledAt), durationMinutes: body.durationMinutes, createdBy: userId ?? undefined });
    logOperationRun({ moduleKey: 'appointments', operationName: 'manual_create_webinar', executionMode: 'manual', status: 'completed', inputPayload: { id, title }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create webinar' }, { status: 500 });
  }
});
