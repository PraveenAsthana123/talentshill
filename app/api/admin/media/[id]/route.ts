import { NextRequest, NextResponse } from 'next/server';
import { getMediaById, updateMedia, deleteMedia } from '@/lib/db/media-queries';
import { deleteFile } from '@/lib/media/upload';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = getMediaById(id);
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ media: item });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    updateMedia(id, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = getMediaById(id);
    if (item) {
      await deleteFile(item.path);
      deleteMedia(id);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
