import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runContentReadinessAgent } from '@/lib/agents/content-readiness-agent';

export const POST = withPermission('content', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { contentId?: string } | null;
  if (!body?.contentId) return NextResponse.json({ error: 'contentId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runContentReadinessAgent({ contentId: body.contentId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.contentId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
