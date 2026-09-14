import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runCompetitorMonitorScanPipeline } from '@/lib/pipelines/competitor-campaign-monitor-pipeline';

export const POST = withPermission('competitor_analysis', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { staleThresholdDays?: number } | null;
  const userId = await getSessionUserIdAsync(request);
  const result = await runCompetitorMonitorScanPipeline({ staleThresholdDays: body?.staleThresholdDays, triggeredBy: userId });
  return NextResponse.json(result);
});
