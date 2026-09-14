import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runYoutubeGrowthAgent } from '@/lib/agents/youtube-growth-agent';

export const POST = withPermission('youtube', 'manage')(async (request: NextRequest, _context: unknown) => {
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runYoutubeGrowthAgent({ triggeredBy: userId });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
