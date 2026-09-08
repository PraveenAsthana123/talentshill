import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db/admin-queries';
import { initJobRunner } from '@/lib/jobs/init';
import { withPermission } from '@/lib/security/rbac';

// Auto-start job runner when admin dashboard loads
initJobRunner();

export const GET = withPermission('dashboard', 'read')(async (
  _request: NextRequest,
  _context: unknown
) => {
  try {
    const stats = getDashboardStats();
    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
});
