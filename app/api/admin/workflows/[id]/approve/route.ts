import { NextRequest, NextResponse } from 'next/server';
import { getWorkflowById, approveWorkflow } from '@/lib/db/marketing-workflow-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
}
