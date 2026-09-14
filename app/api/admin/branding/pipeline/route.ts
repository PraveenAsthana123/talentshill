import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runBrandAssetReadinessPipeline } from '@/lib/pipelines/brand-asset-readiness-pipeline';

export const POST = withPermission('branding', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { assetId?: string } | null;
  if (!body?.assetId) return NextResponse.json({ error: 'assetId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runBrandAssetReadinessPipeline({ assetId: body.assetId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.assetId ? 200 : 404 });
});
