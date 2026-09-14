import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runWebinarConversionPipeline } from '@/lib/pipelines/webinar-pipeline-conversion-pipeline';

export const POST = withPermission('appointments', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const userId = await getSessionUserIdAsync(request);
  const result = await runWebinarConversionPipeline({ webinarId: id, triggeredBy: userId });
  return NextResponse.json(result, { status: result.webinarId ? 200 : 404 });
});
