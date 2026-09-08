import { NextRequest, NextResponse } from 'next/server';
import { getAllFlags, toggleFlag, createFlag } from '@/lib/db/feature-flag-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { bustCache } from '@/lib/feature-flags/cache';

export const GET = withPermission('features', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const flags = getAllFlags();
    return NextResponse.json({ flags });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch flags' }, { status: 500 });
  }
});

export const POST = withPermission('features', 'manage')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { action, id, key, label, description, module, isEnabled } = body;

    if (action === 'toggle' && id) {
      const userId = await getSessionUserIdAsync(request);
      const result = toggleFlag(id, isEnabled, userId ?? undefined);
      bustCache();
      if (!result) {
        return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
      }
      return NextResponse.json({ flag: result });
    }

    if (action === 'create' && key && label) {
      const flagId = createFlag({ key, label, description, module });
      bustCache();
      return NextResponse.json({ id: flagId }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
});
