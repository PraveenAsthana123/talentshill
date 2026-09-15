import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getPerformanceMarketingView } from '@/lib/demos/performance-marketing';

export const GET = withPermission('demo_showcase', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json(getPerformanceMarketingView());
});
