import { NextRequest, NextResponse } from 'next/server';
import { getContacts, getContactCount, createContact, bulkDeleteContacts, bulkUpdateTags } from '@/lib/db/contact-crm-queries';
import { withPermission, getSessionUserIdAsync, checkPermission } from '@/lib/security/rbac';

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

// Not wrapped in withPermission(...) at the top level -- this handler
// multiplexes three distinct operations (single create, bulk-delete,
// bulk-tag) behind one URL, so it needs a per-branch permission check
// rather than one blanket gate. A single 'manage' gate (the earlier
// interim fix) blocked plain single-contact creation for any role that
// only has 'create', which is more restrictive than necessary; this
// restores the intended per-action granularity without changing the
// route surface.
export async function POST(request: NextRequest, context: unknown) {
  const userId = await getSessionUserIdAsync(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();

    // Bulk actions require 'manage' -- more sensitive than a single create.
    if (body.action === 'bulk-delete' && Array.isArray(body.ids)) {
      if (!checkPermission(userId, 'contacts', 'manage')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      bulkDeleteContacts(body.ids);
      return NextResponse.json({ success: true });
    }
    if (body.action === 'bulk-tag' && Array.isArray(body.ids) && Array.isArray(body.tags)) {
      if (!checkPermission(userId, 'contacts', 'manage')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      bulkUpdateTags(body.ids, body.tags);
      return NextResponse.json({ success: true });
    }

    // Single create only needs 'create'.
    if (!checkPermission(userId, 'contacts', 'create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    const { email, firstName, lastName, company, phone, source, tags } = body;
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const id = createContact({ email, firstName, lastName, company, phone, source, tags });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
