import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runVoiceCallQualificationAgent } from '@/lib/agents/voice-call-qualification-agent';

export const POST = withPermission('voice_ai', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runVoiceCallQualificationAgent({ callId: id, triggeredBy: userId });
    return NextResponse.json(result, { status: result.qualification.callId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
