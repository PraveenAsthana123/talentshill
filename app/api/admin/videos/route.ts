import { NextRequest, NextResponse } from 'next/server';
import { getAllVideos, createVideo } from '@/lib/db/admin-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';

export async function GET() {
  try {
    const videos = getAllVideos();
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.videoUrl) {
      return NextResponse.json({ error: 'Title and video URL are required' }, { status: 400 });
    }
    const video = createVideo(body);

    const token = request.cookies.get('admin_session')?.value;
    if (token) {
      const session = await verifyToken(token);
      logAudit({ entityType: 'video', entityId: video.id, action: 'create', userId: session?.userId, metadata: { title: body.title } });
    }

    return NextResponse.json({ video }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
