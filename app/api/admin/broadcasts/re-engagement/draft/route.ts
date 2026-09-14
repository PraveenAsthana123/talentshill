import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runReEngagementMessageAgent } from '@/lib/agents/re-engagement-message-agent';

export const POST = withPermission('broadcasts', 'manage')(async (request: NextRequest, _context: unknown) => {
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runReEngagementMessageAgent({ triggeredBy: userId });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
