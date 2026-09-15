import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { projectAllScenarios } from '@/lib/kpi/growth-scenario';

export const GET = withPermission('growth_scenario', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const months = Number(searchParams.get('months')) || 6;
  return NextResponse.json({ scenarios: projectAllScenarios(months) });
});
