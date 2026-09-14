import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runReelReadinessAgent } from '@/lib/agents/reel-readiness-agent';

export const POST = withPermission('reels_management', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { reelId?: string } | null;
  if (!body?.reelId) return NextResponse.json({ error: 'reelId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runReelReadinessAgent({ reelId: body.reelId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.reelId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
