import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getGoldenPaths, auditGoldenPaths } from '@/lib/goldenpath/golden-path';

export const GET = withPermission('golden_paths', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('audit') === 'true') {
    return NextResponse.json({ audit: auditGoldenPaths() });
  }
  return NextResponse.json({ goldenPaths: getGoldenPaths() });
});
