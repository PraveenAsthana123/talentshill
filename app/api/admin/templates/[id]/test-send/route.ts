import { NextRequest, NextResponse } from 'next/server';
import { getTemplateById, renderTemplate } from '@/lib/db/template-queries';
import { sendEmail } from '@/lib/email/mailer';
import { TestSendSchema } from '@/lib/validation/marketing-schemas';
import { withPermission } from '@/lib/security/rbac';

export const POST = withPermission('templates', 'manage')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = TestSendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const template = getTemplateById(id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const variables = (parsed.data.variables || {}) as Record<string, string>;
    const renderedHtml = renderTemplate(template.htmlContent, variables);
    const renderedSubject = renderTemplate(template.subject, variables);

    const result = await sendEmail({
      to: parsed.data.to,
      subject: `[TEST] ${renderedSubject}`,
      html: renderedHtml,
    });

    return NextResponse.json({ success: result.success, messageId: result.messageId });
  } catch {
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
});
