import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runVoiceCallQualificationPipeline } from '@/lib/pipelines/voice-call-qualification-pipeline';

export const POST = withPermission('voice_ai', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const userId = await getSessionUserIdAsync(request);
  const result = await runVoiceCallQualificationPipeline({ callId: id, triggeredBy: userId });
  return NextResponse.json(result, { status: result.callId ? 200 : 404 });
});
