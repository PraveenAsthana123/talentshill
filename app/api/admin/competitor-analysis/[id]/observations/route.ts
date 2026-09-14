import { NextRequest, NextResponse } from 'next/server';
import { createObservation, getObservationsForCompetitor } from '@/lib/db/competitor-campaign-observation-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('competitor_analysis', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id: competitorId } = await params;
  const items = getObservationsForCompetitor(competitorId);
  return NextResponse.json({ items });
});

export const POST = withPermission('competitor_analysis', 'create')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id: competitorId } = await params;
  const body = await request.json();
  const { observedAt, channel, campaignType, description } = body;
  if (!observedAt || !channel || !campaignType || !description) {
    return NextResponse.json({ error: 'observedAt, channel, campaignType, and description are required' }, { status: 400 });
  }
  const userId = await getSessionUserIdAsync(request);
  const id = createObservation({
    competitorId, observedAt: new Date(observedAt), channel, campaignType, description,
    evidenceUrl: body.evidenceUrl, createdBy: userId ?? undefined,
  });
  logOperationRun({ moduleKey: 'competitor_analysis', operationName: 'manual_create_observation', executionMode: 'manual', status: 'completed', inputPayload: { id, competitorId }, triggeredBy: userId });
  return NextResponse.json({ id }, { status: 201 });
});
