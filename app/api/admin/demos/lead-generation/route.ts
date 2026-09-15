import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getLeadGenerationJourney, getLeadGenerationFunnelSummary } from '@/lib/demos/lead-generation';

export const GET = withPermission('demo_showcase', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({
    journey: getLeadGenerationJourney(5),
    funnel: getLeadGenerationFunnelSummary(),
  });
});
