import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { definePositioningStatement, getPositioningStatements } from '@/lib/positioning/positioning';

export const GET = withPermission('positioning', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ statements: getPositioningStatements() });
});

export const POST = withPermission('positioning', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { forWho?: string; whoNeed?: string; categoryName?: string; keyBenefit?: string; unlikeAlternative?: string; differentiator?: string } | null;
  if (!body?.forWho || !body.whoNeed || !body.categoryName || !body.keyBenefit || !body.unlikeAlternative || !body.differentiator) {
    return NextResponse.json({ error: 'forWho, whoNeed, categoryName, keyBenefit, unlikeAlternative, and differentiator are all required' }, { status: 400 });
  }
  const result = definePositioningStatement({ ...body, forWho: body.forWho, whoNeed: body.whoNeed, categoryName: body.categoryName, keyBenefit: body.keyBenefit, unlikeAlternative: body.unlikeAlternative, differentiator: body.differentiator, confirmedBy: 'admin' });
  return NextResponse.json(result, { status: 201 });
});
