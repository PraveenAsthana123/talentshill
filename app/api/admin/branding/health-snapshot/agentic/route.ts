import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runBrandHealthAgent } from '@/lib/agents/brand-health-agent';

export const POST = withPermission('branding', 'manage')(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({})) as { label?: string; campaignId?: string };
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runBrandHealthAgent({ label: body.label, campaignId: body.campaignId, triggeredBy: userId });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
