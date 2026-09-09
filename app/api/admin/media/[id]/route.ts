import { NextRequest, NextResponse } from 'next/server';
import { getMediaById, updateMedia, deleteMedia } from '@/lib/db/media-queries';
import { deleteFile } from '@/lib/media/upload';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('media', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const item = getMediaById(id);
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ media: item });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
});

export const PATCH = withPermission('media', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    updateMedia(id, body);
    logOperationRun({ moduleKey: 'media', operationName: 'manual_update_media', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
});

export const DELETE = withPermission('media', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    const item = getMediaById(id);
    if (item) {
      await deleteFile(item.path);
      deleteMedia(id);
      logOperationRun({ moduleKey: 'media', operationName: 'manual_delete_media', executionMode: 'manual', status: 'completed', inputPayload: { id, originalName: item.originalName }, triggeredBy: userId });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
});
