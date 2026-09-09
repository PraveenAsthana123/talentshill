import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById, updateSubmissionStatus } from '@/lib/db/contact-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';
import { withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('leads', 'read')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const submission = getSubmissionById(id);
    if (!submission) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ submission });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
});

export const PATCH = withPermission('leads', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const { status } = await request.json();

    if (!status || !['new', 'contacted', 'qualified', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const token = request.cookies.get('admin_session')?.value;
    let userId: string | undefined;
    if (token) {
      const session = await verifyToken(token);
      userId = session?.userId;
    }

    const updated = updateSubmissionStatus(id, status, userId);
    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    logAudit({
      entityType: 'contact',
      entityId: id,
      action: 'update',
      userId,
      metadata: { status },
    });

    logOperationRun({
      moduleKey: 'leads',
      operationName: 'update_status',
      executionMode: 'manual',
      status: 'completed',
      inputPayload: { id, status },
      outputPayload: { id: updated.id, status: updated.status },
      triggeredBy: userId,
    });

    return NextResponse.json({ submission: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
});
