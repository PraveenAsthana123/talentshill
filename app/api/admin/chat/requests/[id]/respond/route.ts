import { NextRequest, NextResponse } from 'next/server';
import { getRequest, createMessage } from '@/lib/db/chat-queries';
import { getSessionById } from '@/lib/db/chat-queries';
import { sendEmail } from '@/lib/email/mailer';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const POST = withPermission('chat', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const { content } = await request.json();
    if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 });

    const req = getRequest(id);
    if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    // Save admin response as assistant message
    const messageId = createMessage({
      sessionId: req.sessionId,
      requestId: id,
      role: 'assistant',
      content,
    });

    // Send email to visitor if email captured
    const session = getSessionById(req.sessionId);
    if (session?.visitorEmail) {
      await sendEmail({
        to: session.visitorEmail,
        subject: 'Response from TalentsHill',
        html: `<p>Hi ${session.visitorName || 'there'},</p><p>${content}</p><p style="color:#999;font-size:12px;">This response is from our support team regarding your chat conversation.</p>`,
      });
    }

    const userId = await getSessionUserIdAsync(request);
    logOperationRun({ moduleKey: 'chat', operationName: 'manual_respond_to_request', executionMode: 'manual', status: 'completed', inputPayload: { requestId: id, contentLength: content.length }, outputPayload: { messageId, emailSent: !!session?.visitorEmail }, triggeredBy: userId });

    return NextResponse.json({ messageId, emailSent: !!session?.visitorEmail });
  } catch {
    return NextResponse.json({ error: 'Failed to send response' }, { status: 500 });
  }
});
