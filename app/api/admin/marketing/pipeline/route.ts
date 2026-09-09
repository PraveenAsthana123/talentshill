import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runWorkflowReadinessPipeline } from '@/lib/pipelines/workflow-readiness-pipeline';

export const POST = withPermission('workflows', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { workflowId?: string } | null;
  if (!body?.workflowId) return NextResponse.json({ error: 'workflowId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runWorkflowReadinessPipeline({ workflowId: body.workflowId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.workflowId ? 200 : 404 });
});
