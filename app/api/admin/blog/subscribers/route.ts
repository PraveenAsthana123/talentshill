import { NextRequest, NextResponse } from 'next/server';
import { getAllSubscribers } from '@/lib/db/blog-queries';
import { withPermission } from '@/lib/security/rbac';

// SECURITY FIX (2026-09-09): this newsletter-subscriber list (real emails,
// PII) previously lived at the unauthenticated GET /api/blog/subscribers,
// meaning anyone could scrape the full subscriber list. POST (signup)
// stays public by design at the old path -- the newsletter opt-in form
// is meant to be reachable by any visitor.
export const GET = withPermission('blog', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || undefined) as 'active' | 'unsubscribed' | 'all' | undefined;
    const subscribers = getAllSubscribers(status);
    return NextResponse.json({ subscribers, total: subscribers.length });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
});
