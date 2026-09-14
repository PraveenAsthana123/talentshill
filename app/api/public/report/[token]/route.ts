import { NextRequest, NextResponse } from 'next/server';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';

// Intentionally unauthenticated -- this is the customer self-service
// surface. Access is gated entirely by possession of the opaque token,
// never by admin session. No admin data beyond the single registered
// report for this token/entityId is ever reachable from here.
export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const resolved = resolveReportShareToken(token);
  if (!resolved) return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  if (!resolved.valid) return NextResponse.json({ error: resolved.reason }, { status: 410 });

  const report = await resolveShareableReport(resolved.moduleKey, resolved.reportType, resolved.entityId);
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  return NextResponse.json(report);
}
