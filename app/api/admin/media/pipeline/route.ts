import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runMediaIntegrityPipeline } from '@/lib/pipelines/media-integrity-pipeline';

export const POST = withPermission('media', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { mediaId?: string } | null;
  if (!body?.mediaId) return NextResponse.json({ error: 'mediaId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runMediaIntegrityPipeline({ mediaId: body.mediaId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.mediaId ? 200 : 404 });
});
