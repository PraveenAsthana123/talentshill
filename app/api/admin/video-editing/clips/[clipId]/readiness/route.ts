import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runClipPlanReadinessPipeline } from '@/lib/pipelines/video-clip-plan-pipeline';

export const POST = withPermission('video_editing', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ clipId: string }> };
  const { clipId } = await params;
  const userId = await getSessionUserIdAsync(request);
  const result = await runClipPlanReadinessPipeline({ clipPlanId: clipId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.clipPlanId ? 200 : 404 });
});
