import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runUserSecurityAgent } from '@/lib/agents/user-security-agent';

export const POST = withPermission('users', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { userId?: string } | null;
  if (!body?.userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runUserSecurityAgent({ userId: body.userId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.userId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
