import { NextRequest, NextResponse } from 'next/server';
import { getReelById, updateReel, deleteReel } from '@/lib/db/reel-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('reels_management', 'read')(async (_request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const item = getReelById(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ reel: item });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reel' }, { status: 500 });
  }
});

export const PATCH = withPermission('reels_management', 'update')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    const data: Record<string, unknown> = { ...body };
    if (body.scheduledAt) data.scheduledAt = new Date(body.scheduledAt);
    if (body.publishedAt) data.publishedAt = new Date(body.publishedAt);
    updateReel(id, data);
    logOperationRun({ moduleKey: 'reels_management', operationName: 'manual_update_reel', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update reel' }, { status: 500 });
  }
});

export const DELETE = withPermission('reels_management', 'delete')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    const item = getReelById(id);
    deleteReel(id);
    logOperationRun({ moduleKey: 'reels_management', operationName: 'manual_delete_reel', executionMode: 'manual', status: 'completed', inputPayload: { id, title: item?.title }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete reel' }, { status: 500 });
  }
});
