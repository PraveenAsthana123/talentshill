import { NextRequest, NextResponse } from 'next/server';
import { validateUnsubscribeToken, markUnsubscribed } from '@/lib/db/tracking-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const tokenRecord = validateUnsubscribeToken(token);

    if (!tokenRecord) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired token' }, { status: 404 });
    }

    return NextResponse.json({ valid: true, contactId: tokenRecord.contactId });
  } catch {
    return NextResponse.json({ error: 'Failed to validate token' }, { status: 500 });
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const tokenRecord = validateUnsubscribeToken(token);

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    markUnsubscribed(token);
    return NextResponse.json({ success: true, message: 'Successfully unsubscribed' });
  } catch {
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
