import { NextRequest, NextResponse } from 'next/server';
import { evaluateSegmentRules } from '@/lib/crm/segment-evaluator';
import { withPermission } from '@/lib/security/rbac';

export const POST = withPermission('lists', 'manage')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    await params; // ensure params resolved
    const body = await request.json();
    const rules = body.rules;
    if (!rules || !rules.logic || !rules.conditions) {
      return NextResponse.json({ error: 'Invalid rules format' }, { status: 400 });
    }
    const result = evaluateSegmentRules(rules);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to evaluate segment' }, { status: 500 });
  }
});
