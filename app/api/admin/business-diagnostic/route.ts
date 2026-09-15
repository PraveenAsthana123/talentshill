import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getDemandMap, getFunnelConstraint } from '@/lib/diagnostic/business-diagnostic';

export const GET = withPermission('business_diagnostic', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ demandMap: getDemandMap(), funnelConstraint: getFunnelConstraint() });
});
