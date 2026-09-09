import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runIndustryContentAgent } from '@/lib/agents/industry-content-agent';

export const POST = withPermission('industries', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { industryId?: string } | null;
  if (!body?.industryId) return NextResponse.json({ error: 'industryId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runIndustryContentAgent({ industryId: body.industryId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.industryId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
