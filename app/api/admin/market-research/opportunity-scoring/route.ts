import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runMarketOpportunityScoringPipeline } from '@/lib/pipelines/market-opportunity-scoring-pipeline';

export const POST = withPermission('market_research', 'manage')(async (request: NextRequest, _context: unknown) => {
  const userId = await getSessionUserIdAsync(request);
  const result = await runMarketOpportunityScoringPipeline({ triggeredBy: userId });
  return NextResponse.json(result);
});
