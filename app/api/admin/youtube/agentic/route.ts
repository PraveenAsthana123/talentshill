import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runYoutubeVideoReadinessAgent } from '@/lib/agents/youtube-video-readiness-agent';

export const POST = withPermission('youtube', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { videoId?: string } | null;
  if (!body?.videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runYoutubeVideoReadinessAgent({ videoId: body.videoId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.videoId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
