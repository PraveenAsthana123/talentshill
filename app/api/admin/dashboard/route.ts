import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db/admin-queries';
import { initJobRunner } from '@/lib/jobs/init';

// Auto-start job runner when admin dashboard loads
initJobRunner();

export async function GET() {
  try {
    const stats = getDashboardStats();
    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
