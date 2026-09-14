import { NextRequest, NextResponse } from 'next/server';
import { getVoiceCallLogById, deleteVoiceCallLog } from '@/lib/db/voice-call-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('voice_ai', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const call = getVoiceCallLogById(id);
  if (!call) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ call });
});

export const DELETE = withPermission('voice_ai', 'delete')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const userId = await getSessionUserIdAsync(request);
  deleteVoiceCallLog(id);
  logOperationRun({ moduleKey: 'voice_ai', operationName: 'manual_delete_call_log', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
  return NextResponse.json({ success: true });
});
