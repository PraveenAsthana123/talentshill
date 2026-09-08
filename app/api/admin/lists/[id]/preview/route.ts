import { NextRequest, NextResponse } from 'next/server';
import { evaluateSegmentRules } from '@/lib/crm/segment-evaluator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
}
