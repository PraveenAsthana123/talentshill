import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/db/blog-queries';
import { withPermission } from '@/lib/security/rbac';

// SECURITY FIX (2026-09-09): admin analytics stats previously lived at
// the unauthenticated /api/blog/stats.
export const GET = withPermission('blog', 'read')(async () => {
  try {
    const stats = getAdminStats();
    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
});
