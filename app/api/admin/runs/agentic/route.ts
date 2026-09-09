import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runRunHealthAgent } from '@/lib/agents/run-health-agent';

export const POST = withPermission('runs', 'update')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { targetRunId?: string } | null;
  if (!body?.targetRunId) return NextResponse.json({ error: 'targetRunId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runRunHealthAgent({ targetRunId: body.targetRunId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.targetRunId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
