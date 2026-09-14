import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runAdBudgetOptimizationPipeline } from '@/lib/pipelines/ad-budget-optimization-pipeline';

export const POST = withPermission('ads_management', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  const result = await runAdBudgetOptimizationPipeline({ triggeredBy: userId });
  return NextResponse.json(result);
});
