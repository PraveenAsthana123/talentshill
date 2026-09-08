import { NextRequest, NextResponse } from 'next/server';
import { getContactById, updateContact, deleteContact, getContactEvents } from '@/lib/db/contact-crm-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('contacts', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const contact = getContactById(id);
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    const events = getContactEvents(id);
    return NextResponse.json({ contact, events });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
  }
});

export const PATCH = withPermission('contacts', 'update')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    updateContact(id, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
});

export const DELETE = withPermission('contacts', 'delete')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    deleteContact(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
});
