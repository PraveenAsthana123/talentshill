import { NextRequest, NextResponse } from 'next/server';
import { getClipPlanById, updateClipPlan, deleteClipPlan } from '@/lib/db/video-clip-plan-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('video_editing', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ clipId: string }> };
  const { clipId } = await params;
  const clip = getClipPlanById(clipId);
  if (!clip) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ clip });
});

export const PATCH = withPermission('video_editing', 'update')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ clipId: string }> };
  const { clipId } = await params;
  const body = await request.json();
  const userId = await getSessionUserIdAsync(request);
  updateClipPlan(clipId, body);
  logOperationRun({ moduleKey: 'video_editing', operationName: 'manual_update_clip_plan', executionMode: 'manual', status: 'completed', inputPayload: { id: clipId, fields: Object.keys(body) }, triggeredBy: userId });
  return NextResponse.json({ success: true });
});

export const DELETE = withPermission('video_editing', 'delete')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ clipId: string }> };
  const { clipId } = await params;
  const userId = await getSessionUserIdAsync(request);
  deleteClipPlan(clipId);
  logOperationRun({ moduleKey: 'video_editing', operationName: 'manual_delete_clip_plan', executionMode: 'manual', status: 'completed', inputPayload: { id: clipId }, triggeredBy: userId });
  return NextResponse.json({ success: true });
});
