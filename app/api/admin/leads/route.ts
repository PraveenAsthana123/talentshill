import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, getContactStats } from '@/lib/db/contact-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('leads', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const data = getContactStats();
      return NextResponse.json({ stats: data });
    }

    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = (searchParams.get('status') || undefined) as
      | 'new'
      | 'contacted'
      | 'qualified'
      | 'closed'
      | 'all'
      | undefined;
    const industry = searchParams.get('industry') || undefined;
    const search = searchParams.get('search') || undefined;
    const leadTier = (searchParams.get('tier') || undefined) as
      | 'hot'
      | 'warm'
      | 'cool'
      | 'cold'
      | undefined;

    const result = getAllSubmissions({ offset, limit, status, industry, search, leadTier });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
});
