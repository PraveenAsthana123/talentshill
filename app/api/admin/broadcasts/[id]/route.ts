import { NextRequest, NextResponse } from 'next/server';
import { getBroadcastById, updateBroadcast, deleteBroadcast, launchBroadcast } from '@/lib/db/broadcast-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const broadcast = getBroadcastById(id);
    if (!broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }
    return NextResponse.json({ broadcast });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch broadcast' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'launch') {
      launchBroadcast(id);
      return NextResponse.json({ success: true });
    }

    updateBroadcast(id, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update broadcast' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteBroadcast(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete broadcast' }, { status: 500 });
  }
}
