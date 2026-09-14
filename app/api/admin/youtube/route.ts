import { NextRequest, NextResponse } from 'next/server';
import { getAllYoutubeVideos, createYoutubeVideo } from '@/lib/db/youtube-video-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('youtube', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const result = getAllYoutubeVideos({ status, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch YouTube videos' }, { status: 500 });
  }
});

export const POST = withPermission('youtube', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { title } = body;
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });
    const userId = await getSessionUserIdAsync(request);
    const id = createYoutubeVideo({ title, description: body.description, tags: body.tags ? JSON.stringify(body.tags) : undefined, createdBy: userId ?? undefined });
    logOperationRun({ moduleKey: 'youtube', operationName: 'manual_create_video', executionMode: 'manual', status: 'completed', inputPayload: { id, title }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create YouTube video' }, { status: 500 });
  }
});
