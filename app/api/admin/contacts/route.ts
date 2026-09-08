import { NextRequest, NextResponse } from 'next/server';
import { getContacts, getContactCount, createContact, bulkDeleteContacts, bulkUpdateTags } from '@/lib/db/contact-crm-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('contacts', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const source = searchParams.get('source') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const contactsList = getContacts({ search, status, source, limit, offset });
    const total = getContactCount({ status, source });
    return NextResponse.json({ contacts: contactsList, total });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
});

export const POST = withPermission('contacts', 'manage')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();

    // Bulk actions
    if (body.action === 'bulk-delete' && Array.isArray(body.ids)) {
      bulkDeleteContacts(body.ids);
      return NextResponse.json({ success: true });
    }
    if (body.action === 'bulk-tag' && Array.isArray(body.ids) && Array.isArray(body.tags)) {
      bulkUpdateTags(body.ids, body.tags);
      return NextResponse.json({ success: true });
    }

    // Single create
    const { email, firstName, lastName, company, phone, source, tags } = body;
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const id = createContact({ email, firstName, lastName, company, phone, source, tags });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
});
