import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { randomUUID } from 'crypto';
import { sendWithProfile } from '@/lib/email/profile-mailer';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const POST = withPermission('email_compose', 'manage')(async (
  request: NextRequest,
  _context: unknown
) => {
  try {
    const body = await request.json();
    const { to, subject, html, profileId } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, html' }, { status: 400 });
    }

    const userId = await getSessionUserIdAsync(request);
    const result = await sendWithProfile('broadcast', { to, subject, html, profileId: profileId || undefined });

    db.insert(schema.emailComposeLog).values({
      id: randomUUID(),
      to,
      subject,
      htmlLength: html.length,
      profileId: profileId || null,
      sent: result.success,
      errorMessage: result.success ? null : 'Send failed',
      triggeredBy: userId,
      createdAt: new Date(),
    }).run();

    logOperationRun({ moduleKey: 'email_compose', operationName: 'manual_send_email', executionMode: 'manual', status: result.success ? 'completed' : 'failed', inputPayload: { to, subject, profileId: profileId || null }, outputPayload: { messageId: result.messageId }, triggeredBy: userId });

    return NextResponse.json({ success: result.success });
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
});
