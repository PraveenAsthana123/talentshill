import { NextRequest, NextResponse } from 'next/server';
import {
  getWorkflowById, updateWorkflowStep, updateWorkflowStatus, deleteWorkflow, getComments,
} from '@/lib/db/marketing-workflow-queries';
import { UpdateWorkflowStepSchema, UpdateWorkflowStatusSchema } from '@/lib/validation/content-schemas';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('workflows', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const workflow = getWorkflowById(id);
    if (!workflow) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    const comments = getComments(id);
    return NextResponse.json({ workflow: { ...workflow, shareLinkIds: workflow.shareLinkIds ? JSON.parse(workflow.shareLinkIds as string) : [] }, comments });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch workflow' }, { status: 500 });
  }
});

export const PATCH = withPermission('workflows', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'update-step') {
      const parsed = UpdateWorkflowStepSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
      const { step, ...data } = parsed.data;
      updateWorkflowStep(id, step, data);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'update-status') {
      const parsed = UpdateWorkflowStatusSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
      updateWorkflowStatus(id, parsed.data.status);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
  }
});

export const DELETE = withPermission('workflows', 'delete')(async (
  _request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    deleteWorkflow(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
  }
});
