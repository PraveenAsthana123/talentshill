import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runBlogReadinessPipeline } from '@/lib/pipelines/blog-readiness-pipeline';

export const POST = withPermission('blog', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { postId?: string } | null;
  if (!body?.postId) return NextResponse.json({ error: 'postId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runBlogReadinessPipeline({ postId: body.postId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.postId ? 200 : 404 });
});
