import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSessionByToken } from '@/lib/db/chat-queries';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });
  const session = getSessionByToken(token);
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  return NextResponse.json(session);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = randomUUID();
    const ipHash = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const id = createSession({
      sessionToken: token,
      ipHash,
      userAgent,
      visitorEmail: body.email,
      visitorName: body.name,
    });
    return NextResponse.json({ id, sessionToken: token });
  } catch {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
