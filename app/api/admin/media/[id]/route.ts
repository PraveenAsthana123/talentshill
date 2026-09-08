import { NextRequest, NextResponse } from 'next/server';
import { getMediaById, updateMedia, deleteMedia } from '@/lib/db/media-queries';
import { deleteFile } from '@/lib/media/upload';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('media', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const item = getMediaById(id);
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ media: item });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
});

export const PATCH = withPermission('media', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    updateMedia(id, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
});

export const DELETE = withPermission('media', 'delete')(async (
  _request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
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
});
