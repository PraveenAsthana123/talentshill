import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runBrandHealthPipeline } from '@/lib/pipelines/brand-health-pipeline';

export const POST = withPermission('branding', 'manage')(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({})) as { label?: string; campaignId?: string };
  const userId = await getSessionUserIdAsync(request);
  const result = await runBrandHealthPipeline({ label: body.label, campaignId: body.campaignId, triggeredBy: userId });
  return NextResponse.json(result);
});
