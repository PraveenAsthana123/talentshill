import { NextRequest, NextResponse } from 'next/server';
import { getAllRuns, getRunCount } from '@/lib/db/run-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');

    const filters = { type, status };
    const runs = getAllRuns(filters, offset, limit);
    const total = getRunCount(filters);

    return NextResponse.json({ runs, total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 });
  }
}
