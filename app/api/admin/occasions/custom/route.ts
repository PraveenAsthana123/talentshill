import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createOccasionMessage } from '@/lib/db/occasion-queries';
import { logOperationRun } from '@/lib/operation-run';

// A real, admin-typed one-off message to one real contact -- never a
// template, never LLM-composed. status is always 'logged', never a
// fabricated delivery confirmation (same honesty boundary as every
// other send in this module -- no real SMS/WhatsApp/email gateway
// exists in this build).
export const POST = withPermission('occasions', 'manage')(async (request: NextRequest) => {
  const body = await request.json().catch(() => null) as {
    contactId?: string; channel?: 'email' | 'sms' | 'whatsapp'; subject?: string | null; messageBody?: string;
  } | null;

  if (!body?.contactId) return NextResponse.json({ error: 'contactId is required' }, { status: 400 });
  if (!body.channel || !['email', 'sms', 'whatsapp'].includes(body.channel)) {
    return NextResponse.json({ error: "channel must be 'email', 'sms', or 'whatsapp'" }, { status: 400 });
  }
  if (!body.messageBody?.trim()) return NextResponse.json({ error: 'messageBody is required' }, { status: 400 });

  const contact = db.select().from(schema.contacts).where(eq(schema.contacts.id, body.contactId)).get();
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

  const userId = await getSessionUserIdAsync(request);
  const id = createOccasionMessage({
    contactId: body.contactId, occasionType: 'custom', channel: body.channel,
    subject: body.subject ?? null, messageBody: body.messageBody, status: 'logged',
    triggeredAt: new Date(), createdBy: userId,
  });

  logOperationRun({ moduleKey: 'occasions', operationName: 'manual_send_custom_message', executionMode: 'manual', status: 'completed', inputPayload: { contactId: body.contactId, channel: body.channel }, outputPayload: { id }, triggeredBy: userId });
  return NextResponse.json({ id }, { status: 201 });
});
