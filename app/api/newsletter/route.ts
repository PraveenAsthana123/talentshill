import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/db/blog-queries';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const result = addSubscriber(email);
    return NextResponse.json(result, { status: result.success ? 201 : 409 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
