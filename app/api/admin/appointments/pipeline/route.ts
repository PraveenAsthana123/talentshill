import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runAppointmentFollowupPipeline } from '@/lib/pipelines/appointment-followup-pipeline';

export const POST = withPermission('appointments', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { appointmentId?: string } | null;
  if (!body?.appointmentId) return NextResponse.json({ error: 'appointmentId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = runAppointmentFollowupPipeline({ appointmentId: body.appointmentId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.appointmentId ? 200 : 404 });
});
