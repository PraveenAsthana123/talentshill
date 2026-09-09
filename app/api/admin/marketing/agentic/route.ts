import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runWorkflowReadinessAgent } from '@/lib/agents/workflow-readiness-agent';

export const POST = withPermission('workflows', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { workflowId?: string } | null;
  if (!body?.workflowId) return NextResponse.json({ error: 'workflowId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runWorkflowReadinessAgent({ workflowId: body.workflowId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.workflowId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
