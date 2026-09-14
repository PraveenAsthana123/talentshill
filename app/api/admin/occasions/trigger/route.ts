import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runOccasionTriggerPipeline } from '@/lib/pipelines/occasion-trigger-pipeline';

export const POST = withPermission('occasions', 'manage')(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({})) as { channel?: string } | null;
  const channel = body?.channel;
  if (!channel || !['email', 'sms', 'whatsapp'].includes(channel)) {
    return NextResponse.json({ error: "channel must be 'email', 'sms', or 'whatsapp'" }, { status: 400 });
  }
  const userId = await getSessionUserIdAsync(request);
  const result = await runOccasionTriggerPipeline({ channel: channel as 'email' | 'sms' | 'whatsapp', triggeredBy: userId });
  return NextResponse.json(result);
});
