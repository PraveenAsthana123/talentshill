import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions, getSessionCount } from '@/lib/db/chat-queries';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const offset = parseInt(sp.get('offset') || '0');
  const limit = parseInt(sp.get('limit') || '50');
  const status = sp.get('status') || undefined;

  const sessions = getAllSessions({ offset, limit, status });
  const total = getSessionCount(status);
  return NextResponse.json({ sessions, total, offset, limit });
}
