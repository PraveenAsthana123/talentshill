import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runRepurposingCoveragePipeline } from '@/lib/pipelines/video-clip-plan-pipeline';

export const POST = withPermission('video_editing', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const userId = await getSessionUserIdAsync(request);
  const result = await runRepurposingCoveragePipeline({ sourceProjectId: id, triggeredBy: userId });
  return NextResponse.json(result, { status: result.sourceProjectId ? 200 : 404 });
});
