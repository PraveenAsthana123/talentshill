import { NextRequest, NextResponse } from 'next/server';
import { getMediaList, getMediaCount, createMedia } from '@/lib/db/media-queries';
import { handleUpload } from '@/lib/media/upload';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';

export const GET = withPermission('media', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || undefined;
    const mimeType = searchParams.get('mimeType') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const items = getMediaList({ folder, mimeType, search, limit, offset });
    const total = getMediaCount({ folder });
    return NextResponse.json({ media: items, total });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
});

export const POST = withPermission('media', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const userId = await getSessionUserIdAsync(request);
    const result = await handleUpload(file, folder || undefined);

    const id = createMedia({
      ...result,
      folder: folder || undefined,
      uploadedBy: userId ?? undefined,
    });

    return NextResponse.json({ id, url: result.url }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
