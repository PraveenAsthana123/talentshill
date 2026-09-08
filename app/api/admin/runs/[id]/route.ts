import { NextRequest, NextResponse } from 'next/server';
import { getRun, updateRunStatus, getRunTimeline } from '@/lib/db/run-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const run = getRun(id);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }
    const events = getRunTimeline(id);
    return NextResponse.json({ run, events });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch run' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.status) {
      updateRunStatus(id, body.status);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update run' }, { status: 500 });
  }
}
