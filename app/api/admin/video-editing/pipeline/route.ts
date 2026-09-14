import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runVideoProjectReadinessPipeline } from '@/lib/pipelines/video-project-readiness-pipeline';

export const POST = withPermission('video_editing', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { projectId?: string } | null;
  if (!body?.projectId) return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runVideoProjectReadinessPipeline({ projectId: body.projectId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.projectId ? 200 : 404 });
});
