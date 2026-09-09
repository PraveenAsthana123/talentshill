import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runCampaignSubjectAgent } from '@/lib/agents/campaign-subject-agent';

export const POST = withPermission('campaigns', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { campaignId?: string } | null;
  if (!body?.campaignId) return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });

  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runCampaignSubjectAgent({ campaignId: body.campaignId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.campaignId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
