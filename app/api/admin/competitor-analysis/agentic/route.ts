import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runCompetitorResearchAgent } from '@/lib/agents/competitor-research-agent';

export const POST = withPermission('competitor_analysis', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as {
    serviceId?: string; competitorName?: string; competitorWebsite?: string;
  } | null;

  if (!body?.serviceId || !body?.competitorName) {
    return NextResponse.json({ error: 'serviceId and competitorName are required' }, { status: 400 });
  }

  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runCompetitorResearchAgent({
      serviceId: body.serviceId,
      competitorName: body.competitorName,
      competitorWebsite: body.competitorWebsite,
      triggeredBy: userId,
    });
    return NextResponse.json(result, { status: result.competitorAnalysisId ? 201 : 422 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
