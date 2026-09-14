import { NextRequest, NextResponse } from 'next/server';
import { getAllVideoProjects, createVideoProject } from '@/lib/db/video-project-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('video_editing', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const tool = searchParams.get('tool') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const result = getAllVideoProjects({ status, tool, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch video projects' }, { status: 500 });
  }
});

export const POST = withPermission('video_editing', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { title, tool } = body;
    if (!title || !tool) return NextResponse.json({ error: 'title and tool are required' }, { status: 400 });
    const userId = await getSessionUserIdAsync(request);
    const id = createVideoProject({ title, tool, strategyNotes: body.strategyNotes, outputUrl: body.outputUrl, durationSeconds: body.durationSeconds, createdBy: userId ?? undefined });
    logOperationRun({ moduleKey: 'video_editing', operationName: 'manual_create_project', executionMode: 'manual', status: 'completed', inputPayload: { id, title, tool }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create video project' }, { status: 500 });
  }
});
