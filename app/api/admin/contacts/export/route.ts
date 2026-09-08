import { NextResponse } from 'next/server';
import { getContacts } from '@/lib/db/contact-crm-queries';

export async function GET() {
  try {
    const allContacts = getContacts({ limit: 10000 });

    const headers = ['email', 'firstName', 'lastName', 'company', 'phone', 'source', 'status', 'leadScore', 'tags', 'createdAt'];
    const rows = allContacts.map(c => [
      c.email,
      c.firstName || '',
      c.lastName || '',
      c.company || '',
      c.phone || '',
      c.source,
      c.status,
      String(c.leadScore || 0),
      c.tags || '',
      c.createdAt ? new Date(typeof c.createdAt === 'number' ? c.createdAt * 1000 : c.createdAt).toISOString() : '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export contacts' }, { status: 500 });
  }
}
