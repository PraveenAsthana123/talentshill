import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { recordActivity, getActivities, getActivitySummary, type CoveredDemoKey } from '@/lib/marketing-activity/activity-log';

export const GET = withPermission('marketing_activity_log', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const demoKey = searchParams.get('demoKey');
  if (demoKey) return NextResponse.json({ activities: getActivities(demoKey as CoveredDemoKey) });
  return NextResponse.json(getActivitySummary());
});

export const POST = withPermission('marketing_activity_log', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as
    | { demoKey?: string; channel?: string; action?: string; outcomeMetricName?: string; outcomeMetricValue?: number; notes?: string }
    | null;
  if (!body?.demoKey || !body.channel || !body.action) return NextResponse.json({ error: 'demoKey, channel, and action are required' }, { status: 400 });
  try {
    const id = recordActivity({ demoKey: body.demoKey as CoveredDemoKey, channel: body.channel, action: body.action, outcomeMetricName: body.outcomeMetricName, outcomeMetricValue: body.outcomeMetricValue, notes: body.notes, loggedBy: 'admin' });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to record activity' }, { status: 400 });
  }
});
