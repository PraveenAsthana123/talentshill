import { NextRequest, NextResponse } from 'next/server';
import { getAllBroadcasts, createBroadcast } from '@/lib/db/broadcast-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('broadcasts', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const broadcasts = getAllBroadcasts();
    return NextResponse.json({ broadcasts });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch broadcasts' }, { status: 500 });
  }
});

export const POST = withPermission('broadcasts', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    const id = createBroadcast({
      ...body,
      createdBy: userId ?? undefined,
    });
    logOperationRun({ moduleKey: 'broadcasts', operationName: 'manual_create_broadcast', executionMode: 'manual', status: 'completed', inputPayload: { name: body.name, audienceType: body.audienceType }, outputPayload: { id }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create broadcast' }, { status: 500 });
  }
});
