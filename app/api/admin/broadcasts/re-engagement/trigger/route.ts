import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runReEngagementTriggerPipeline } from '@/lib/pipelines/re-engagement-trigger-pipeline';

export const POST = withPermission('broadcasts', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { channel?: string; messageTemplate?: string; thresholdDays?: number; cooldownDays?: number } | null;
  if (!body?.channel || (body.channel !== 'sms' && body.channel !== 'whatsapp')) {
    return NextResponse.json({ error: "channel must be 'sms' or 'whatsapp'" }, { status: 400 });
  }
  if (!body.messageTemplate || !body.messageTemplate.trim()) {
    return NextResponse.json({ error: 'messageTemplate is required' }, { status: 400 });
  }
  const userId = await getSessionUserIdAsync(request);
  const result = await runReEngagementTriggerPipeline({
    channel: body.channel, messageTemplate: body.messageTemplate,
    thresholdDays: body.thresholdDays, cooldownDays: body.cooldownDays,
    triggeredBy: userId,
  });
  return NextResponse.json(result);
});
