import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runContentPerformanceAgent } from '@/lib/agents/content-performance-agent';

export const POST = withPermission('content', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runContentPerformanceAgent({ triggeredBy: userId });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
