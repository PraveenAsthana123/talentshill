import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runMarketResearchSynthesisAgent } from '@/lib/agents/market-research-synthesis-agent';

export const POST = withPermission('market_research', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { briefId?: string } | null;
  if (!body?.briefId) return NextResponse.json({ error: 'briefId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runMarketResearchSynthesisAgent({ briefId: body.briefId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.briefId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
