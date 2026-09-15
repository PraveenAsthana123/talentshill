import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getSalesTalkingPoints } from '@/lib/presales/sales-copilot';

export const GET = withPermission('sales_copilot', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const competitorId = searchParams.get('competitorId') ?? undefined;
  return NextResponse.json({ talkingPoints: getSalesTalkingPoints(competitorId) });
});
