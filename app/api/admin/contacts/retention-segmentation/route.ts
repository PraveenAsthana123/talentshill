import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runContactRetentionSegmentationPipeline } from '@/lib/pipelines/contact-retention-segmentation-pipeline';

export const POST = withPermission('contacts', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  const result = await runContactRetentionSegmentationPipeline({ triggeredBy: userId });
  return NextResponse.json(result);
});
