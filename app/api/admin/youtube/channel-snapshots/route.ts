import { NextRequest, NextResponse } from 'next/server';
import { getAllChannelSnapshots, createChannelSnapshot } from '@/lib/db/youtube-channel-snapshot-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('youtube', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const result = getAllChannelSnapshots({ limit, offset });
  return NextResponse.json({ items: result.items, total: result.total, offset, limit });
});

export const POST = withPermission('youtube', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json();
  const { snapshotDate, subscriberCount, totalViews } = body;
  if (!snapshotDate || subscriberCount === undefined || totalViews === undefined) {
    return NextResponse.json({ error: 'snapshotDate, subscriberCount, and totalViews are required' }, { status: 400 });
  }
  const userId = await getSessionUserIdAsync(request);
  const id = createChannelSnapshot({
    snapshotDate: new Date(snapshotDate), subscriberCount: Number(subscriberCount), totalViews: Number(totalViews),
    totalWatchTimeMinutes: body.totalWatchTimeMinutes !== undefined ? Number(body.totalWatchTimeMinutes) : undefined,
    notes: body.notes, createdBy: userId ?? undefined,
  });
  logOperationRun({ moduleKey: 'youtube', operationName: 'manual_create_channel_snapshot', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
  return NextResponse.json({ id }, { status: 201 });
});
