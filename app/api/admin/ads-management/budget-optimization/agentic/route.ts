import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runAdBudgetOptimizationAgent } from '@/lib/agents/ad-budget-optimization-agent';

export const POST = withPermission('ads_management', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runAdBudgetOptimizationAgent({ triggeredBy: userId });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
