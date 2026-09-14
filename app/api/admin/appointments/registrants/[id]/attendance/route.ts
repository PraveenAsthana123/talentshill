import { NextRequest, NextResponse } from 'next/server';
import { recordAttendance } from '@/lib/db/webinar-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const POST = withPermission('appointments', 'update')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const body = await request.json();
  if (typeof body.attended !== 'boolean') return NextResponse.json({ error: 'attended (boolean) is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  recordAttendance(id, { attended: body.attended, engagementNotes: body.engagementNotes });
  logOperationRun({ moduleKey: 'appointments', operationName: 'manual_record_attendance', executionMode: 'manual', status: 'completed', inputPayload: { id, attended: body.attended }, triggeredBy: userId });
  return NextResponse.json({ success: true });
});
