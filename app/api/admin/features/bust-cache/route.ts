import { NextRequest, NextResponse } from 'next/server';
import { bustCache } from '@/lib/feature-flags/cache';
import { withPermission } from '@/lib/security/rbac';

export const POST = withPermission('features', 'manage')(async (_request: NextRequest, _context: unknown) => {
  try {
    bustCache();
    return NextResponse.json({ success: true, message: 'Cache busted' });
  } catch {
    return NextResponse.json({ error: 'Failed to bust cache' }, { status: 500 });
  }
});
