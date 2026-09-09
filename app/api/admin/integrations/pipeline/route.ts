import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runIntegrationAccountReadinessPipeline } from '@/lib/pipelines/integration-account-readiness-pipeline';

export const POST = withPermission('integrations', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { accountId?: string } | null;
  if (!body?.accountId) return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runIntegrationAccountReadinessPipeline({ accountId: body.accountId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.accountId ? 200 : 404 });
});
