import { NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/db/admin-queries';

export async function GET() {
  try {
    const entries = getRecentActivity(15);
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
