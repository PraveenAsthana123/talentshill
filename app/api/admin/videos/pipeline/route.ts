import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runVideoContentPipeline } from '@/lib/pipelines/video-content-pipeline';

export const POST = withPermission('videos', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { videoId?: string } | null;
  if (!body?.videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runVideoContentPipeline({ videoId: body.videoId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.videoId ? 200 : 404 });
});
