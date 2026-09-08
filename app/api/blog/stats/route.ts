import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/db/blog-queries';

export async function GET() {
  try {
    const stats = getAdminStats();
    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
