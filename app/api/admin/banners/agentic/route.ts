import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runBannerHealthAgent } from '@/lib/agents/banner-health-agent';

export const POST = withPermission('banners', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { bannerId?: string } | null;
  if (!body?.bannerId) return NextResponse.json({ error: 'bannerId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runBannerHealthAgent({ bannerId: body.bannerId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.bannerId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
