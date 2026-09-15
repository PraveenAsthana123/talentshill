import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { computeAndRankOpportunities, getLatestOpportunities } from '@/lib/opportunity/opportunity-engine';

export const GET = withPermission('opportunities', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ candidates: getLatestOpportunities() });
});

// Re-ranks real gaps from the latest real KPI snapshots -- run KPI Engine's
// recompute first if you want this to reflect fresh data.
export const POST = withPermission('opportunities', 'manage')(async (_request: NextRequest, _context: unknown) => {
  const candidates = computeAndRankOpportunities();
  return NextResponse.json({ candidates });
});
