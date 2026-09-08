import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowById, approveWorkflow } from '@/lib/db/marketing-workflow-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';

export const POST = withPermission('workflows', 'manage')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const workflow = getWorkflowById(id);
    if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    const userId = await getSessionUserIdAsync(request);
    approveWorkflow(id, userId ?? 'system');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to approve workflow' }, { status: 500 });
  }
});
