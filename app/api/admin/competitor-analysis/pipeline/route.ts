import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runCompetitorResearchPipeline } from '@/lib/pipelines/competitor-research-pipeline';

// Pipeline execution mode for the same underlying "research a competitor"
// operation the Manual tab exposes -- gated at 'manage' (a distinct,
// automated write path deserves a stricter permission than plain
// 'create'), same pattern as this module's other action-style routes.
export const POST = withPermission('competitor_analysis', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as {
    serviceId?: string; competitorName?: string; competitorWebsite?: string;
  } | null;

  if (!body?.serviceId || !body?.competitorName) {
    return NextResponse.json({ error: 'serviceId and competitorName are required' }, { status: 400 });
  }

  const userId = await getSessionUserIdAsync(request);
  const result = await runCompetitorResearchPipeline({
    serviceId: body.serviceId,
    competitorName: body.competitorName,
    competitorWebsite: body.competitorWebsite,
    triggeredBy: userId,
  });

  return NextResponse.json(result, { status: result.competitorAnalysisId ? 201 : 422 });
});
