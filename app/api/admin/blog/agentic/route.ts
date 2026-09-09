import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runBlogReadinessAgent } from '@/lib/agents/blog-readiness-agent';

export const POST = withPermission('blog', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { postId?: string } | null;
  if (!body?.postId) return NextResponse.json({ error: 'postId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runBlogReadinessAgent({ postId: body.postId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.postId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
