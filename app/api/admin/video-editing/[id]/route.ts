import { NextRequest, NextResponse } from 'next/server';
import { getVideoProjectById, updateVideoProject, deleteVideoProject } from '@/lib/db/video-project-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('video_editing', 'read')(async (_request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const item = getVideoProjectById(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ project: item });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch video project' }, { status: 500 });
  }
});

export const PATCH = withPermission('video_editing', 'update')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    updateVideoProject(id, body);
    logOperationRun({ moduleKey: 'video_editing', operationName: 'manual_update_project', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update video project' }, { status: 500 });
  }
});

export const DELETE = withPermission('video_editing', 'delete')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    const item = getVideoProjectById(id);
    deleteVideoProject(id);
    logOperationRun({ moduleKey: 'video_editing', operationName: 'manual_delete_project', executionMode: 'manual', status: 'completed', inputPayload: { id, title: item?.title }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete video project' }, { status: 500 });
  }
});
