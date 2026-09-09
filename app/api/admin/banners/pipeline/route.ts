import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runBannerHealthPipeline } from '@/lib/pipelines/banner-health-pipeline';

export const POST = withPermission('banners', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { bannerId?: string } | null;
  if (!body?.bannerId) return NextResponse.json({ error: 'bannerId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runBannerHealthPipeline({ bannerId: body.bannerId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.bannerId ? 200 : 404 });
});
