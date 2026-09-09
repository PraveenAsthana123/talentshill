import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('contacts', 'read')(async (_request: NextRequest, _context: unknown) => {
  const contacts = db.select().from(schema.contacts).orderBy(desc(schema.contacts.leadScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalContacts: contacts.length,
    contacts: contacts.map((c) => ({
      name: [c.firstName, c.lastName].filter(Boolean).join(' ') || '—',
      email: c.email, company: c.company, source: c.source, status: c.status, leadScore: c.leadScore,
    })),
  });
});
