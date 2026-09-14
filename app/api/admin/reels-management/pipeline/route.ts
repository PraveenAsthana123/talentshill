import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runReelReadinessPipeline } from '@/lib/pipelines/reel-readiness-pipeline';

export const POST = withPermission('reels_management', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { reelId?: string } | null;
  if (!body?.reelId) return NextResponse.json({ error: 'reelId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runReelReadinessPipeline({ reelId: body.reelId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.reelId ? 200 : 404 });
});
