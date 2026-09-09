import { NextRequest, NextResponse } from 'next/server';
import { getRequest, updateRequestStatus, assignRequest } from '@/lib/db/chat-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('chat', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const req = getRequest(id);
  if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  return NextResponse.json(req);
});

export const PATCH = withPermission('chat', 'update')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const body = await request.json();
  const userId = await getSessionUserIdAsync(request);

  if (body.status) updateRequestStatus(id, body.status);
  if (body.assignedTo) assignRequest(id, body.assignedTo);
  logOperationRun({ moduleKey: 'chat', operationName: 'manual_update_request', executionMode: 'manual', status: 'completed', inputPayload: { id, status: body.status, assignedTo: body.assignedTo }, triggeredBy: userId });

  const updated = getRequest(id);
  return NextResponse.json(updated);
});
