import { NextRequest, NextResponse } from 'next/server';
import { getWebinarById, updateWebinarStatus, deleteWebinar, getRegistrantsForWebinar } from '@/lib/db/webinar-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('appointments', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const webinar = getWebinarById(id);
  if (!webinar) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const registrants = getRegistrantsForWebinar(id);
  return NextResponse.json({ webinar, registrants });
});

export const PATCH = withPermission('appointments', 'update')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const body = await request.json();
  const userId = await getSessionUserIdAsync(request);
  if (body.status) updateWebinarStatus(id, body.status);
  logOperationRun({ moduleKey: 'appointments', operationName: 'manual_update_webinar', executionMode: 'manual', status: 'completed', inputPayload: { id, status: body.status }, triggeredBy: userId });
  return NextResponse.json({ success: true });
});

export const DELETE = withPermission('appointments', 'delete')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const userId = await getSessionUserIdAsync(request);
  deleteWebinar(id);
  logOperationRun({ moduleKey: 'appointments', operationName: 'manual_delete_webinar', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
  return NextResponse.json({ success: true });
});
