import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { getAllReEngagementMessages } from '@/lib/db/re-engagement-queries';

export const GET = withPermission('broadcasts', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const result = getAllReEngagementMessages({ channel, limit, offset });
  return NextResponse.json({ items: result.items, total: result.total, offset, limit });
});
