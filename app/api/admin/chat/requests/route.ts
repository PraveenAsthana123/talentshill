import { NextRequest, NextResponse } from 'next/server';
import { getAllRequests, getRequestCount } from '@/lib/db/chat-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('chat', 'read')(async (request: NextRequest, _context: unknown) => {
  const sp = request.nextUrl.searchParams;
  const offset = parseInt(sp.get('offset') || '0');
  const limit = parseInt(sp.get('limit') || '50');
  const status = sp.get('status') || undefined;
  const priority = sp.get('priority') || undefined;

  const requests = getAllRequests({ offset, limit, status, priority });
  const total = getRequestCount(status);
  return NextResponse.json({ requests, total, offset, limit });
});
