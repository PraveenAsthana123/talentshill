import { NextRequest, NextResponse } from 'next/server';
import { getAllVideos, createVideo } from '@/lib/db/admin-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';
import { withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('videos', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const videos = getAllVideos();
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
});

export const POST = withPermission('videos', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    if (!body.title || !body.videoUrl) {
      return NextResponse.json({ error: 'Title and video URL are required' }, { status: 400 });
    }
    const video = createVideo(body);

    const token = request.cookies.get('admin_session')?.value;
    const userId = token ? (await verifyToken(token))?.userId ?? null : null;
    if (userId) {
      logAudit({ entityType: 'video', entityId: video.id, action: 'create', userId, metadata: { title: body.title } });
    }
    logOperationRun({
      moduleKey: 'videos', operationName: 'create_video', executionMode: 'manual', status: 'completed',
      inputPayload: { title: body.title }, outputPayload: { id: video.id }, triggeredBy: userId,
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
});
