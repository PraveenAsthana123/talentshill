import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runBroadcastReadinessPipeline } from '@/lib/pipelines/broadcast-readiness-pipeline';

export const POST = withPermission('broadcasts', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { broadcastId?: string } | null;
  if (!body?.broadcastId) return NextResponse.json({ error: 'broadcastId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runBroadcastReadinessPipeline({ broadcastId: body.broadcastId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.broadcastId ? 200 : 404 });
});
