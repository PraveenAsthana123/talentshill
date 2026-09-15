import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getSeoContentView } from '@/lib/demos/seo-content';

export const GET = withPermission('demo_showcase', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json(getSeoContentView());
});
