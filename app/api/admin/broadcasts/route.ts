import { NextRequest, NextResponse } from 'next/server';
import { getAllBroadcasts, createBroadcast } from '@/lib/db/broadcast-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET() {
  try {
    const broadcasts = getAllBroadcasts();
    return NextResponse.json({ broadcasts });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch broadcasts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    const id = createBroadcast({
      ...body,
      createdBy: userId ?? undefined,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create broadcast' }, { status: 500 });
  }
}
