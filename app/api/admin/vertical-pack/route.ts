import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { defineVertical, getVerticalPacks } from '@/lib/vertical/vertical-pack';

export const GET = withPermission('vertical_pack', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ verticals: getVerticalPacks() });
});

export const POST = withPermission('vertical_pack', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { verticalKey?: string; verticalName?: string; description?: string; realKpiDimensions?: string[] } | null;
  if (!body?.verticalKey || !body.verticalName || !body.description || !body.realKpiDimensions) {
    return NextResponse.json({ error: 'verticalKey, verticalName, description, and realKpiDimensions are required' }, { status: 400 });
  }
  try {
    const id = defineVertical({ ...body, verticalKey: body.verticalKey, verticalName: body.verticalName, description: body.description, realKpiDimensions: body.realKpiDimensions, confirmedBy: 'admin' });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to define vertical' }, { status: 400 });
  }
});
