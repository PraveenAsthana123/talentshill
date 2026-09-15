import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getControlTowerView } from '@/lib/demos/control-tower';

export const GET = withPermission('demo_showcase', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json(getControlTowerView());
});
