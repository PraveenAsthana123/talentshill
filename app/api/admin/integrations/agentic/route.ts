import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runIntegrationAccountReadinessAgent } from '@/lib/agents/integration-account-readiness-agent';

export const POST = withPermission('integrations', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { accountId?: string } | null;
  if (!body?.accountId) return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runIntegrationAccountReadinessAgent({ accountId: body.accountId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.accountId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
