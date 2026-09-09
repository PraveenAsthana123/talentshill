import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runAppointmentFollowupAgent } from '@/lib/agents/appointment-followup-agent';

export const POST = withPermission('appointments', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { appointmentId?: string } | null;
  if (!body?.appointmentId) return NextResponse.json({ error: 'appointmentId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runAppointmentFollowupAgent({ appointmentId: body.appointmentId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.appointmentId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
