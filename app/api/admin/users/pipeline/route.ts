import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runUserSecurityPipeline } from '@/lib/pipelines/user-security-pipeline';

export const POST = withPermission('users', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { userId?: string } | null;
  if (!body?.userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runUserSecurityPipeline({ userId: body.userId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.userId ? 200 : 404 });
});
