import { NextRequest, NextResponse } from 'next/server';
import { createClipPlan, getClipPlansForSource } from '@/lib/db/video-clip-plan-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('video_editing', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id: sourceProjectId } = await params;
  const items = getClipPlansForSource(sourceProjectId);
  return NextResponse.json({ items });
});

export const POST = withPermission('video_editing', 'create')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id: sourceProjectId } = await params;
  const body = await request.json();
  const { title, startSeconds, endSeconds, targetPlatform, targetAspectRatio } = body;
  if (!title || startSeconds === undefined || endSeconds === undefined || !targetPlatform || !targetAspectRatio) {
    return NextResponse.json({ error: 'title, startSeconds, endSeconds, targetPlatform, and targetAspectRatio are required' }, { status: 400 });
  }
  const userId = await getSessionUserIdAsync(request);
  const id = createClipPlan({
    sourceProjectId, title, startSeconds: Number(startSeconds), endSeconds: Number(endSeconds),
    targetPlatform, targetAspectRatio, notes: body.notes, createdBy: userId ?? undefined,
  });
  logOperationRun({ moduleKey: 'video_editing', operationName: 'manual_create_clip_plan', executionMode: 'manual', status: 'completed', inputPayload: { id, sourceProjectId }, triggeredBy: userId });
  return NextResponse.json({ id }, { status: 201 });
});
