import { NextRequest, NextResponse } from 'next/server';
import { getAppointments, getStats } from '@/lib/appointments-db';
import { withPermission } from '@/lib/security/rbac';

// SECURITY FIX (2026-09-09): this list previously lived at the
// unauthenticated /api/appointments (middleware only guards /admin and
// /api/admin paths, so that route served full customer PII -- name,
// email, phone, company, budget, requirements -- to anyone). Moved here
// under RBAC. The public booking flow only ever called POST
// /api/appointments and GET /api/appointments/slots (verified via repo
// grep), so those remain at the old path unauthenticated by design.
export const GET = withPermission('appointments', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    if (includeStats) {
      const stats = getStats();
      return NextResponse.json({ stats });
    }

    const appointments = getAppointments({
      status: searchParams.get('status') || undefined,
      date: searchParams.get('date') || undefined,
      search: searchParams.get('search') || undefined,
    });

    return NextResponse.json({ appointments, total: appointments.length });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
});
