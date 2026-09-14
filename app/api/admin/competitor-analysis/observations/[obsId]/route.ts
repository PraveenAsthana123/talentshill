import { NextRequest, NextResponse } from 'next/server';
import { deleteObservation } from '@/lib/db/competitor-campaign-observation-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const DELETE = withPermission('competitor_analysis', 'delete')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ obsId: string }> };
  const { obsId } = await params;
  const userId = await getSessionUserIdAsync(request);
  deleteObservation(obsId);
  logOperationRun({ moduleKey: 'competitor_analysis', operationName: 'manual_delete_observation', executionMode: 'manual', status: 'completed', inputPayload: { id: obsId }, triggeredBy: userId });
  return NextResponse.json({ success: true });
});
