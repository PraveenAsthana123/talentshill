import { NextRequest, NextResponse } from 'next/server';
import { createRegistrant } from '@/lib/db/webinar-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const POST = withPermission('appointments', 'create')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id: webinarId } = await params;
  const body = await request.json();
  const { fullName, email } = body;
  if (!fullName || !email) return NextResponse.json({ error: 'fullName and email are required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const id = createRegistrant({ webinarId, fullName, email, phone: body.phone, company: body.company, consent: !!body.consent });
  logOperationRun({ moduleKey: 'appointments', operationName: 'manual_add_registrant', executionMode: 'manual', status: 'completed', inputPayload: { id, webinarId }, triggeredBy: userId });
  return NextResponse.json({ id }, { status: 201 });
});
