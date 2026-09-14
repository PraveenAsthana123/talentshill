import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById, updateSubmissionQualification, type QualificationStage } from '@/lib/db/contact-queries';
import { QUALIFICATION_STAGE_ORDER } from '@/lib/contact/lead-qualification-stage';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';
import { logAudit } from '@/lib/db/admin-queries';

// Manual promotion/demotion of a lead's qualification stage, or
// assignment to a salesperson. The pipeline sets an initial stage from
// the computed tier (see classifyQualificationStage); this route is the
// human-in-the-loop override -- real sales judgment, not automated.
export const PATCH = withPermission('leads', 'update')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const body = await request.json().catch(() => null) as { qualificationStage?: QualificationStage; assignedTo?: string | null } | null;

  if (!body || (body.qualificationStage === undefined && body.assignedTo === undefined)) {
    return NextResponse.json({ error: 'qualificationStage or assignedTo is required' }, { status: 400 });
  }
  if (body.qualificationStage !== undefined && !QUALIFICATION_STAGE_ORDER.includes(body.qualificationStage)) {
    return NextResponse.json({ error: `qualificationStage must be one of: ${QUALIFICATION_STAGE_ORDER.join(', ')}` }, { status: 400 });
  }

  const existing = getSubmissionById(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const userId = await getSessionUserIdAsync(request);
  const updated = updateSubmissionQualification(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  logAudit({ entityType: 'contact', entityId: id, action: 'update', userId: userId ?? undefined, metadata: body });
  logOperationRun({
    moduleKey: 'leads', operationName: 'update_qualification', executionMode: 'manual', status: 'completed',
    inputPayload: { id, ...body }, outputPayload: { id: updated.id, qualificationStage: updated.qualificationStage, assignedTo: updated.assignedTo },
    triggeredBy: userId,
  });

  return NextResponse.json({ submission: updated });
});
