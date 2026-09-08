import { NextRequest, NextResponse } from 'next/server';
import { parseCsvText, importContacts } from '@/lib/crm/csv-import';
import { withPermission } from '@/lib/security/rbac';

export const POST = withPermission('contacts', 'manage')(async (request: NextRequest, _context: unknown) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCsvText(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows found in CSV' }, { status: 400 });
    }

    const result = importContacts(rows);
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
