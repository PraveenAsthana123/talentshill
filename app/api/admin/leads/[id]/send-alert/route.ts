import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById } from '@/lib/db/contact-queries';
import { sendHotLeadAlertIfNeeded } from '@/lib/contact/lead-alert';
import { withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

// Manual trigger for an admin who wants to force-check/send the hot-lead
// alert (e.g. after manually promoting a lead to 'sql'). Idempotent --
// sendHotLeadAlertIfNeeded no-ops if alertSentAt is already set.
export const POST = withPermission('leads', 'manage')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;

  const submission = getSubmissionById(id);
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const sent = await sendHotLeadAlertIfNeeded(submission, submission.qualificationStage || 'unqualified');

  logOperationRun({
    moduleKey: 'leads', operationName: 'manual_send_alert', executionMode: 'manual', status: 'completed',
    inputPayload: { id }, outputPayload: { sent },
  });

  return NextResponse.json({ sent, reason: sent ? 'Alert sent' : 'Not eligible (not hot tier, or already alerted)' });
});
