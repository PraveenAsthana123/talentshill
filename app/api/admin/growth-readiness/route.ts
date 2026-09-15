import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { computeAndSnapshotGrowthReadiness, getLatestGrowthReadiness } from '@/lib/kpi/growth-readiness';

export const GET = withPermission('growth_readiness', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ snapshot: getLatestGrowthReadiness() });
});

// Reads the real KPI Engine's latest snapshots -- run KPI Engine's
// recompute first for fresh underlying data.
export const POST = withPermission('growth_readiness', 'manage')(async (_request: NextRequest, _context: unknown) => {
  const result = computeAndSnapshotGrowthReadiness();
  return NextResponse.json(result);
});
