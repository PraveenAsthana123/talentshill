import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/db/admin-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('activity', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const entries = getRecentActivity(15);
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
});
