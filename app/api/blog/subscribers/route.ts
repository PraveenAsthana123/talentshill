import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/db/blog-queries';

// SECURITY FIX (2026-09-09): GET (full subscriber list, real emails)
// removed -- it previously required zero auth, letting anyone scrape the
// entire newsletter list. The admin-gated equivalent now lives at
// /api/admin/blog/subscribers. POST (signup) stays here and stays public
// by design: this is the real newsletter opt-in endpoint.
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const result = addSubscriber(email);
    return NextResponse.json(result, { status: result.success ? 201 : 409 });
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
