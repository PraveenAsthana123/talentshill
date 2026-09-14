import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runMarketResearchReadinessPipeline } from '@/lib/pipelines/market-research-readiness-pipeline';

export const POST = withPermission('market_research', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { briefId?: string } | null;
  if (!body?.briefId) return NextResponse.json({ error: 'briefId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runMarketResearchReadinessPipeline({ briefId: body.briefId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.briefId ? 200 : 404 });
});
