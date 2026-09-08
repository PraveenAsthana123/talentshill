import { NextRequest, NextResponse } from 'next/server';
import { getLogs, getLogCount } from '@/lib/db/integration-log-queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sp = request.nextUrl.searchParams;
  const offset = parseInt(sp.get('offset') || '0');
  const limit = parseInt(sp.get('limit') || '50');
  const logs = getLogs(id, { offset, limit });
  const total = getLogCount(id);
  return NextResponse.json({ logs, total, offset, limit });
}
