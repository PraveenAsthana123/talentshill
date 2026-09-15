import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getDemoRecommendation } from '@/lib/presales/demo-recommendation';

export const GET = withPermission('demo_recommendation', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ recommendation: getDemoRecommendation() });
});
