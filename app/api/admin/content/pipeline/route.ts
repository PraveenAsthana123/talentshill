import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runContentReadinessPipeline } from '@/lib/pipelines/content-readiness-pipeline';

export const POST = withPermission('content', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { contentId?: string } | null;
  if (!body?.contentId) return NextResponse.json({ error: 'contentId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runContentReadinessPipeline({ contentId: body.contentId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.contentId ? 200 : 404 });
});
