import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, getAllSubscribers } from '@/lib/db/blog-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || undefined) as 'active' | 'unsubscribed' | 'all' | undefined;
    const subscribers = getAllSubscribers(status);
    return NextResponse.json({ subscribers, total: subscribers.length });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

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
