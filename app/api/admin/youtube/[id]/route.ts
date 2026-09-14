import { NextRequest, NextResponse } from 'next/server';
import { getYoutubeVideoById, updateYoutubeVideo, deleteYoutubeVideo } from '@/lib/db/youtube-video-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('youtube', 'read')(async (_request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const item = getYoutubeVideoById(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ video: item });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch YouTube video' }, { status: 500 });
  }
});

export const PATCH = withPermission('youtube', 'update')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    const data: Record<string, unknown> = { ...body };
    if (body.scheduledAt) data.scheduledAt = new Date(body.scheduledAt);
    if (body.publishedAt) data.publishedAt = new Date(body.publishedAt);
    if (body.tags) data.tags = JSON.stringify(body.tags);
    updateYoutubeVideo(id, data);
    logOperationRun({ moduleKey: 'youtube', operationName: 'manual_update_video', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update YouTube video' }, { status: 500 });
  }
});

export const DELETE = withPermission('youtube', 'delete')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    const item = getYoutubeVideoById(id);
    deleteYoutubeVideo(id);
    logOperationRun({ moduleKey: 'youtube', operationName: 'manual_delete_video', executionMode: 'manual', status: 'completed', inputPayload: { id, title: item?.title }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete YouTube video' }, { status: 500 });
  }
});
