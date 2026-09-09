import { NextRequest, NextResponse } from 'next/server';
import { getVideoById, updateVideo, deleteVideo } from '@/lib/db/admin-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';
import { withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('videos', 'read')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const video = getVideoById(id);
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ video });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
});

export const PATCH = withPermission('videos', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    const video = updateVideo(id, body);
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const token = request.cookies.get('admin_session')?.value;
    const userId = token ? (await verifyToken(token))?.userId ?? null : null;
    if (userId) {
      logAudit({ entityType: 'video', entityId: id, action: 'update', userId });
    }
    logOperationRun({
      moduleKey: 'videos', operationName: 'update_video', executionMode: 'manual', status: 'completed',
      inputPayload: { id, fields: Object.keys(body) }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ video });
  } catch {
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
});

export const DELETE = withPermission('videos', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const deleted = deleteVideo(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const token = request.cookies.get('admin_session')?.value;
    const userId = token ? (await verifyToken(token))?.userId ?? null : null;
    if (userId) {
      logAudit({ entityType: 'video', entityId: id, action: 'delete', userId });
    }
    logOperationRun({
      moduleKey: 'videos', operationName: 'delete_video', executionMode: 'manual', status: 'completed',
      inputPayload: { id }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
});
