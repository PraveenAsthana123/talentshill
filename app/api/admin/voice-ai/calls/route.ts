import { NextRequest, NextResponse } from 'next/server';
import { getAllVoiceCallLogs, createVoiceCallLog } from '@/lib/db/voice-call-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('voice_ai', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const result = getAllVoiceCallLogs({ tier, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch call logs' }, { status: 500 });
  }
});

export const POST = withPermission('voice_ai', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { direction, transcript } = body;
    if (!direction || !transcript) return NextResponse.json({ error: 'direction and transcript are required' }, { status: 400 });
    const userId = await getSessionUserIdAsync(request);
    const id = createVoiceCallLog({
      direction, transcript,
      contactId: body.contactId, phoneNumber: body.phoneNumber, durationSeconds: body.durationSeconds,
      callDate: body.callDate ? new Date(body.callDate) : undefined,
      createdBy: userId ?? undefined,
      consentRecorded: typeof body.consentRecorded === 'boolean' ? body.consentRecorded : undefined,
      consentNotes: body.consentNotes,
    });
    logOperationRun({ moduleKey: 'voice_ai', operationName: 'manual_create_call_log', executionMode: 'manual', status: 'completed', inputPayload: { id, direction }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create call log' }, { status: 500 });
  }
});
